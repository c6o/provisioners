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

        if (app.spec.routes?.simple?.tcp) {
            await this.checkPortConflict(app)
            await this.addTcpPortGateway(app)
            //await this.removeTcpPortGateway(app)
            await this.addTcpPortLoadBalancer(app)
            //await this.removeTcpPortLoadBalancer(app)
        }
        const vs = this.virtualService(app, gateway)
        const result = await this.manager.cluster
            .begin(`Installing Virtual Service for ${app.metadata.namespace}/${app.metadata.name}`)
                .addOwner(app)
                .upsert(vs)
            .end()
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

    getTcpPortNumber(app: AppDocument) {
        return app.spec.routes.simple.tcp.inboundPort
    }

    setTcpPortNumber(app: AppDocument, portNumber: number) {
        return app.spec.routes.simple.tcp.inboundPort = portNumber
    }

    getTcpPortName(app: AppDocument) {
        return `tcp-${app.metadata.namespace}-${app.metadata.name}`
    }

    gatewayTcpPortTemplate = (app: AppDocument) => ({
        hosts: ['*'],
        port: {
            name: this.getTcpPortName(app),
            protocol: 'TCP',
            number: this.getTcpPortNumber(app)
        }
    })

    async getGateway() {
        return await this.manager.cluster.read(this.gateway)
    }

    generateUsablePortNumber() {
        return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024 // usable port range between 1024 and 65535
    }

    async checkPortConflict(app: AppDocument) {
        const portName = this.getTcpPortName(app)
        let portNumber = this.getTcpPortNumber(app)

        // the LoadBalancer is the source of truth since it's the first layer
        const loadBalancerPorts = (await this.getLoadBalancer()).object.spec.ports
        let conflict = loadBalancerPorts.some(item => item.port === portNumber && item.name !== portName)
        while (conflict) {
            portNumber = this.generateUsablePortNumber()
            conflict = loadBalancerPorts.some(item => item.port === portNumber)
            if (!conflict)
                this.setTcpPortNumber(app, portNumber)
        }
    }

    async addTcpPortGateway(app: AppDocument) {
        const gatewayServers = (await this.getGateway()).object.spec.servers

        const item = this.gatewayTcpPortTemplate(app)
        const alreadyExists = gatewayServers.find(item => item.port?.name === this.getTcpPortName(app))
        if (!alreadyExists)
            return await this.manager.cluster.patch(this.gateway, [{ 'op': 'add', 'path': '/spec/servers/-', 'value': item } ])

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(this.getTcpPortName(app));
        return await this.manager.cluster.patch(this.gateway, [{ 'op': 'replace', 'path': `/spec/servers/${index}`, 'value': item } ])
    }

    async removeTcpPortGateway(app: AppDocument) {
        const gatewayServers: any[] = (await this.getGateway()).object.spec.servers

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(this.getTcpPortName(app));
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
        name: this.getTcpPortName(app),
        protocol: 'TCP',
        port: this.getTcpPortNumber(app),
        targetPort: this.getTcpPortNumber(app)
    })

    async addTcpPortLoadBalancer(app: AppDocument) {
        const loadBalancerPorts = (await this.getLoadBalancer()).object.spec.ports

        const item = this.loadBalancerTcpPortTemplate(app)
        const alreadyExists = loadBalancerPorts.find(item => item.name === this.getTcpPortName(app))
        if (!alreadyExists)
            return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'add', 'path': '/spec/ports/-', 'value': item } ])

        const index = loadBalancerPorts.map(function(item) { return item.name }).indexOf(this.getTcpPortName(app));
        return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'replace', 'path': `/spec/ports/${index}`, 'value': item } ])
    }

    async removeTcpPortLoadBalancer(app: AppDocument) {
        const loadBalancerPorts: any[] = (await this.getLoadBalancer()).object.spec.ports

        const index = loadBalancerPorts.map(function(item) { return item.name }).indexOf(this.getTcpPortName(app));
        if (index !== -1) {
            return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'remove', 'path': `/spec/ports/${index}` } ])
        }
    }
}