import { baseProvisionerType } from '../../'
import { Result } from '@traxitt/kubeclient'

export const gatewayApiMixin = (base: baseProvisionerType) => class extends base {

    gatewayTemplate = (namespace, name) => ({
        apiVersion: 'networking.istio.io/v1alpha3',
        kind: 'Gateway',
        metadata: {
            namespace,
            name
        },
        spec: {
            selector: {
                istio: 'ingressgateway'
            },
            servers: undefined
        }
    })

    async findGateway(namespace, name) {
        return await this.manager.cluster.read({
            apiVersion: 'networking.istio.io/v1alpha3',
            kind: 'Gateway',
            metadata: {
                name,
                namespace
            }
        })
    }

    async createGateway(namespace: string, name: string, servers?): Promise<Result> {
        let result = await this.findGateway(namespace, name)
        if (result.object)
            return result

        const template = this.gatewayTemplate(namespace, name)
        if (servers)
            template.spec.servers = servers

        result = await this.manager.cluster.create(template)
        if (result.object) {
            // The following hack causes istio to refresh all gateways
            const refresher = this.gatewayTemplate('istio-system', 'bogus-gateway')
            await this.manager.cluster.create(refresher)
            await this.manager.cluster.delete(refresher)
        }
        return result
    }

    async removeGateway(namespace: string, name: string) {
        const template = this.gatewayTemplate(namespace, name)
        return await this.manager.cluster.delete(template)
    }

    async getExternalIPAddress() {
        let externalIP = null
        await this.manager.cluster.
            begin(`Fetch external IP address`)
            .beginWatch({
                kind: 'Service',
                metadata: {
                    namespace: 'istio-system',
                    labels: {
                        istio: 'ingressgateway'
                    }
                }
            })
            .whenWatch(({ obj }) => obj.status?.loadBalancer?.ingress?.length && obj.status?.loadBalancer?.ingress[0].ip, (processor, service) => {
                externalIP = service.status.loadBalancer.ingress[0].ip
                processor.endWatch()
            })
            .end()

        return externalIP
    }
}