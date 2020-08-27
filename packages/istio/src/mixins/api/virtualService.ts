import { KubeDocument, Result } from '@c6o/kubeclient'
import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const virtualServiceApiMixin = (base: baseProvisionerType) => class extends base {

    async createVirtualService(app: AppDocument, gateway: string): Promise<Result> {
        debugger
        app.spec.routes.simple.tcp = {
            service : 'node-red',
            inboundPort : 80
        }
        const vs = this.virtualService(app, gateway)
        const result = await this.manager.cluster
            .begin(`Installing Virtual Service for ${app.metadata.namespace}/${app.metadata.name}`)
                .addOwner(app)
                .upsert(vs)
            .end()
        if (!result.error && app.spec.routes?.simple?.tcp) {
            await this.checkPortConflict(app)
            const ggb1 = await this.addTcpPortGateway(app)
            const ggb3 = await this.removeTcpPortGateway(app)
            //const ggb2 = await this.addTcpPortLoadBalancer(app)
        }
        return result
    }

    async removeVirtualService(namespace: string, name: string) {
        await this.manager.cluster
            .begin(`Removing Virtual Service for ${namespace}/${name}`)
            .delete({
                apiVersion: 'networking.istio.io/v1alpha3',
                kind: 'VirtualService',
                metadata: {
                    name,
                    namespace
                }
            })
            .end()
    }

    simpleTcpSection = (app: AppDocument) => {
        const tcp: any = {
            match: [
                {
                    port: app.spec.routes.simple.tcp.inboundPort // TODO: may be in use!
                }
            ],
            route: [
                {
                    destination: {
                        host: app.spec.routes.simple.tcp.service
                    }
                }
            ]
        }
        if (app.spec.routes.simple.tcp.port)
            tcp.route[0].destination.port = app.spec.routes.simple.tcp.port
        return tcp
    }

    simpleHttpSection = (app: AppDocument) => {
        const http: any = {
                match: [
                    {
                        headers: {
                            ':authority': {
                                "regex": `^${app.metadata.name}-${app.metadata.namespace}\\..*`
                            }
                        }
                    }
                ],
                route: [
                    {
                        destination: {
                            host: app.spec.routes.simple.http.service
                        }
                    }
                ]
            }

        if (app.spec.routes.simple.http.prefix)
            http.match.push({uri: {prefix : app.spec.routes.simple.http.prefix}})
        if (app.spec.routes.simple.http.rewrite)
            http.rewrite = {uri : app.spec.routes.simple.http.rewrite}
        if (app.spec.routes.simple.http.port)
            http.route[0].destination.port = app.spec.routes.simple.http.port
        return http
    }

    virtualService = (app: AppDocument, gateway: string) => ({
        apiVersion: 'networking.istio.io/v1alpha3',
        kind: 'VirtualService',
        metadata: {
            name: app.metadata.name,
            namespace: app.metadata.namespace,
            labels: { ...app.metadata.labels }
        },
        spec: {
            hosts: ['*'],
            gateways: [gateway],
            http: [app.spec.routes?.simple?.http ? this.simpleHttpSection(app) : undefined],
            tcp: [app.spec.routes?.simple?.tcp ? this.simpleTcpSection(app) : undefined]
        }
    })

    gatewayTcpPortTemplate = (name: string, portNumber: number) => ({
        hosts: ['*'],
        port: {
            name: name,
            protocol: 'TCP',
            number: portNumber
        }
    })

    async getGateway() {
        return await this.manager.cluster.read(this.gateway)
    }

    generateUsablePortNumber() {
        return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024 // usable port range between 1024 and 65535
    }

    async checkPortConflict(app: AppDocument) {
        const portName = `tcp-${app.metadata.namespace}-${app.metadata.name}`
        let portNumber = app.spec.routes.simple.tcp.inboundPort

        // the LoadBalancer is the source of truth since it's the first layer
        const loadBalancerPorts = (await this.getLoadBalancer()).object.spec.ports
        let conflict = loadBalancerPorts.some(item => item.port === portNumber && item.name !== portName)
        while (conflict) {
            portNumber = this.generateUsablePortNumber()
            conflict = loadBalancerPorts.some(item => item.port === portNumber)
            if (!conflict)
                app.spec.routes.simple.tcp.inboundPort = portNumber
        }
    }

    async addTcpPortGateway(app: AppDocument) {
        const portName = `tcp-${app.metadata.namespace}-${app.metadata.name}`
        let portNumber = app.spec.routes.simple.tcp.inboundPort
        const gatewayServers = (await this.getGateway()).object.spec.servers

        const server = this.gatewayTcpPortTemplate(portName, portNumber)
        const alreadyExists = gatewayServers.find(item => item.port?.name === portName)
        if (!alreadyExists)
            return await this.manager.cluster.patch(this.gateway, [{ 'op': 'add', 'path': '/spec/servers/-', 'value': server } ])

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(portName);
        return await this.manager.cluster.patch(this.gateway, [{ 'op': 'replace', 'path': `/spec/servers/${index}`, 'value': server } ])
    }

    async removeTcpPortGateway(app: AppDocument) {
        const portName = `tcp-${app.metadata.namespace}-${app.metadata.name}`
        const gatewayServers: any[] = (await this.getGateway()).object.spec.servers

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(portName);
        if (index !== -1) {
            return await this.manager.cluster.patch(this.gateway, [{ 'op': 'remove', 'path': `/spec/servers/${index}` } ])
        }
    }

    loadBalancer = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: 'istio-ingressgateway',
            namespace: 'istio-system'
        }
    }

    async getLoadBalancer() {
        return await this.manager.cluster.read(this.loadBalancer)
    }

    loadBalancerTcpPortTemplate = (app: AppDocument) => ({
        name: `tcp-${app.metadata.namespace}-${app.metadata.name}`,
        protocol: 'TCP',
        port: app.spec.routes.simple.tcp.inboundPort,
        targetPort: app.spec.routes.simple.tcp.inboundPort
    })

    async addTcpPortLoadBalancer(app: AppDocument) {
        const ggb = this.loadBalancerTcpPortTemplate(app)
        return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'add', 'path': '/spec/ports/-', 'value': ggb }])
    }

    async removeTcpPortLoadBalancer(app: AppDocument) {
        return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'remove', 'path': `/spec/ports?name=tcp-${app.metadata.namespace}-${app.metadata.name}` }])
    }
}