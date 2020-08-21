import { KubeDocument, Result } from '@c6o/kubeclient'
import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const virtualServiceApiMixin = (base: baseProvisionerType) => class extends base {

    async createVirtualService(app: AppDocument, gateway: string): Promise<Result> {

        const vs = this.virtualService(app, gateway)
        return await this.manager.cluster
            .begin(`Installing Virtual Service for ${app.metadata.namespace}/${app.metadata.name}`)
                .addOwner(app)
                .upsert(vs)
            .end()
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

    gatewayTcpPortTemplate = (name, port) => ({
        hosts: ['*'],
        port: {
            name: `tcp-${name}`,
            protocol: 'TCP',
            number: port
        }
    })

    async addTcpPortGateway(name, port) {
        return await this.manager.cluster.patch(this.gateway, [{ 'op': 'insert', 'path': '/spec/servers', 'value': [this.gatewayTcpPortTemplate(name, port) ]} ])
    }

    async removeTcpPort(name) {
        return await this.manager.cluster.patch(this.gateway, [{ 'op': 'remove', 'path': `/spec/servers?port.name=tcp-${name}` }])
    }

    loadBalancer = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: 'istio-ingressgateway',
            namespace: 'istio-system'
        }
    }

    loadBalancerTcpPortTemplate = (name, port) => ({
        name: `tcp-${name}`,
        protocol: 'TCP',
        port: port,
        targetPort: port
    })

    async addTcpPortLoadBalancer(name, port) {
        return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'insert', 'path': '/spec/ports', 'value': [this.loadBalancerTcpPortTemplate(name, port) ]} ])
    }

    async removeTcpPortLoadBalancer(name) {
        return await this.manager.cluster.patch(this.loadBalancer, [{ 'op': 'remove', 'path': `/spec/ports?name=tcp-${name}` }])
    }
}