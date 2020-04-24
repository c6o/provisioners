import { KubeDocument, Result } from '@traxitt/kubeclient'
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
                                "regex": `^${app.metadata.name}\\.${app.metadata.namespace}\\..*`
                            }
                        }
                    }
                ],
                route: [
                    {
                        destination: {
                            host: app.routes.simple.http.service
                        }
                    }
                ]
            }

        if (app.routes.simple.http?.prefix)
            http.match.push({uri: {prefix : app.routes.simple.http.prefix}})
        if (app.routes.simple.http?.rewrite)
            http.rewrite = {uri : app.routes.simple.http.rewrite}
        if (app.routes.simple.http?.port)
            http.route[0].destination.port = app.routes.simple.http.port
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
            http: [app.routes.simple ? this.simpleHttpSection(app) : undefined]
        }
    })
}