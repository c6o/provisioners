import { Result, Resource } from '@c6o/kubeclient-contracts'
import { AppResource, RoutesType } from '@provisioner/contracts'
import { baseProvisionerType } from '../../'
import createDebug from 'debug'

const debug = createDebug('istio:api:virtualService:')

export const virtualServiceApiMixin = (base: baseProvisionerType) => class extends base {

    app: AppResource

    async upsertVirtualService(app: AppResource, gateway: string): Promise<Result> {
        this.app = app

        if (!app.spec.routes)
            return

        const vs = this.virtualService(app, gateway)

        for (const route of app.spec.routes) {
            if (route.disabled || route.private)
                continue

            // http routes handled by ingressProxy
            if (route.type === 'tcp') {
                if (!route.tcp.port || route.tcp.port === 0)
                    route.tcp.port = this.generateUsablePortNumber()

                await this.checkPortConflict(route)
                await this.addTcpPortGateway(route)
                await this.addTcpPortLoadBalancer(route)
                vs.spec.tcp.push(this.simpleTcpSection(route))
            }
        }

        if (vs.spec.tcp.length === 0)
            return

        const result = await this.controller.cluster
            .begin(`Installing Virtual Service for ${app.metadata.namespace}/${app.metadata.name}`)
                .addOwner(app)
                .upsert(vs)
            .end()
        return result
    }

    async removeVirtualService(app: AppResource) {
        this.app = app

        if (!app.spec.routes)
            return

        for (const route of app.spec.routes) {
            if (route.disabled || route.private)
                return

            if (route.type === 'tcp') {
                await this.removeTcpPortGateway(route)
                await this.removeTcpPortLoadBalancer(route)
            }
        }

        await this.controller.cluster
            .begin(`Removing Virtual Service for ${app.metadata.namespace}/${app.metadata.name}`)
                .delete({
                    apiVersion: 'networking.istio.io/v1alpha3',
                    kind: 'VirtualService',
                    metadata: {
                        name: app.metadata.name,
                        namespace: app.metadata.namespace
                    }
                })
            .end()
    }

    simpleTcpSection = (route: RoutesType) => {
        const tcp: any = {
            match: [
                {
                    port: route.tcp.port
                }
            ],
            route: [
                {
                    destination: {
                        host: route.targetService
                    }
                }
            ]
        }
        if (route.targetPort)
            tcp.route[0].destination.port = { number: route.targetPort }
        return tcp
    }

    getApplicationPrefix(appName: string, namespace: string) { return `${appName}--${namespace}` }

    simpleHttpSection = (route: RoutesType) => {
        const http: any = {
                match: [
                    {
                        headers: {
                            ':authority': {
                                'regex': `^${this.getApplicationPrefix(this.app.metadata.name, this.app.metadata.namespace)}\\..*`
                            }
                        }
                    }
                ],
                route: [
                    {
                        destination: {
                            host: route.targetService
                        }
                    }
                ]
            }

        if (route.http?.prefix)
            http.match.push({uri: {prefix : route.http.prefix}})
        if (route.http?.rewrite)
            http.rewrite = {uri : route.http.rewrite}
        if (route.targetPort)
            http.route[0].destination.port = { number: route.targetPort }
        return http
    }

    virtualService = (app: AppResource, gateway: string) => ({
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
            http: [],
            tcp: []
        }
    })

    getTcpPortNumber(route: RoutesType) {
        return route.tcp.port
    }

    setTcpPortNumber(route: RoutesType, port: number) {
        route.tcp.port = port
    }

    getTcpPortName(route: RoutesType) {
        return `tcp-${this.app.metadata.namespace}-${this.app.metadata.name}-${route.tcp.name}`
    }

    gatewayTcpPortTemplate = (route: RoutesType) => ({
        hosts: ['*'],
        port: {
            name: this.getTcpPortName(route),
            protocol: 'TCP',
            number: this.getTcpPortNumber(route)
        }
    })

    async getGateway(): Promise<Resource> {
        const result = await this.controller.cluster.read(this.gateway)
        result.throwIfError()
        return result.object
    }

    async getLoadBalancer(): Promise<Resource> {
        const result = await this.controller.cluster.read(this.loadBalancer)
        result.throwIfError()
        return result.object
    }


    generateUsablePortNumber() {
        return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024 // usable port range between 1024 and 65535
    }

    async checkPortConflict(route: RoutesType) {
        const portName = this.getTcpPortName(route)
        let portNumber = this.getTcpPortNumber(route)

        // the LoadBalancer is the source of truth since it's the first layer
        const loadBalancer = await this.getLoadBalancer()
        const loadBalancerPorts = loadBalancer.spec.ports
        let conflict = loadBalancerPorts.some(item => item.port === portNumber && item.name !== portName)
        if (conflict && route.tcp?.strictPort)
            throw new Error('Port conflict encountered with .tcp.strictPort route setting')

        while (conflict) {
            portNumber = this.generateUsablePortNumber()
            conflict = loadBalancerPorts.some(item => item.port === portNumber)
            if (!conflict)
                this.setTcpPortNumber(route, portNumber)
        }
    }

    async addTcpPortGateway(route: RoutesType) {
        const gateway = await this.getGateway()
        const gatewayServers: any[] = gateway.spec.servers

        const item = this.gatewayTcpPortTemplate(route)
        const alreadyExists = gatewayServers.find(item => item.port?.name === this.getTcpPortName(route))
        if (!alreadyExists)
            return await this.controller.cluster.patch(this.gateway, [{ 'op': 'add', 'path': '/spec/servers/-', 'value': item } ])

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(this.getTcpPortName(route))
        return await this.controller.cluster.patch(this.gateway, [{ 'op': 'replace', 'path': `/spec/servers/${index}`, 'value': item } ])
    }

    async removeTcpPortGateway(route: RoutesType) {
        const gateway = await this.getGateway()
        const gatewayServers: any[] = gateway.spec.servers

        const index = gatewayServers.map(function(item) { return item.port?.name }).indexOf(this.getTcpPortName(route))
        if (index !== -1) {
            return await this.controller.cluster.patch(this.gateway, [{ 'op': 'remove', 'path': `/spec/servers/${index}` } ])
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

    loadBalancerTcpPortTemplate = (route: RoutesType) => ({
        name: this.getTcpPortName(route),
        protocol: 'TCP',
        port: this.getTcpPortNumber(route),
        targetPort: this.getTcpPortNumber(route)
    })

    async addTcpPortLoadBalancer(route: RoutesType) {
        const loadBalancer = await this.getLoadBalancer()
        const loadBalancerPorts = loadBalancer.spec.ports

        const item = this.loadBalancerTcpPortTemplate(route)
        const alreadyExists = loadBalancerPorts.find(item => item.name === this.getTcpPortName(route))
        if (!alreadyExists)
            return await this.controller.cluster.patch(this.loadBalancer, [{ 'op': 'add', 'path': '/spec/ports/-', 'value': item } ])

        const index = loadBalancerPorts.map(function(item) { return item.name }).indexOf(this.getTcpPortName(route))
        return await this.controller.cluster.patch(this.loadBalancer, [{ 'op': 'replace', 'path': `/spec/ports/${index}`, 'value': item } ])
    }

    async removeTcpPortLoadBalancer(route: RoutesType) {
        const loadBalancerPorts: any[] = (await this.getLoadBalancer()).spec.ports

        const index = loadBalancerPorts.map(function(item) { return item.name }).indexOf(this.getTcpPortName(route))
        if (index !== -1) {
            return await this.controller.cluster.patch(this.loadBalancer, [{ 'op': 'remove', 'path': `/spec/ports/${index}` } ])
        }
    }
}