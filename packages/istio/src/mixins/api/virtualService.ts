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

    simpleHttpSection = (app: AppDocument) => {
        const http: any =  {
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

        if (app.spec.routes.simple.http?.prefix)
            http.match.push({uri: {prefix : app.spec.routes.simple.http.prefix}})
        if (app.spec.routes.simple.http?.rewrite)
            http.rewrite = {uri : app.spec.routes.simple.http.rewrite}
        if (app.spec.routes.simple.http?.port)
            http.route[0].destination.port = app.spec.routes.simple.http.port
        return http
    }

    simpleTCPSection = (app: AppDocument) => {
        const tcp: any =  {
                match: [{ port: 22 }],
                route: [
                    {
                        destination: {
                            host: app.spec.routes.simple.tcp.service,
                            port: {
                                number: 22
                            }
                        }
                    }
                ]
            }

        // if (app.spec.routes.simple.tcp?.port)
        //     tcp.route[0].destination.port = app.spec.routes.simple.tcp.port
        return tcp
    }

    virtualService = (app: AppDocument, gateway: string) => {
        debugger
        const vs: any = {
            apiVersion: 'networking.istio.io/v1alpha3',
            kind: 'VirtualService',
            metadata: {
                name: app.metadata.name,
                namespace: app.metadata.namespace,
                labels: { ...app.metadata.labels }
            },
            spec: {
                hosts: ['*'],
                gateways: [gateway]
            }
        }

        if (app.spec.routes.simple.http) {
            vs.spec.http = [this.simpleHttpSection(app)]
            vs.spec.https = [this.simpleHttpSection(app)]
        }
        if (app.spec.routes.simple.tcp)
            vs.spec.tcp = [this.simpleTCPSection(app)]
        return vs
    }
}