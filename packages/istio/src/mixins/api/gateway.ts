import { baseProvisionerType } from '../../'
import { Result } from '@c6o/kubeclient-contracts'
import { ServiceHelper } from '@provisioner/common'

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
        return await super.cluster.read({
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

        result = await super.cluster.upsert(template)
        if (result.object) {
            // The following hack causes istio to refresh all gateways
            const refresher = this.gatewayTemplate('istio-system', 'bogus-gateway')
            await super.cluster.create(refresher)
            await super.cluster.delete(refresher)
        }
        return result
    }

    async removeGateway(namespace: string, name: string) {
        const template = this.gatewayTemplate(namespace, name)
        return await super.cluster.delete(template)
    }

    async getExternalAddress() {
        return await ServiceHelper
            .from('istio-system')
            .setLabel('istio', 'istio-ingressgateway')
            .awaitServiceAddress(super.cluster, 'Fetching external address')
    }
}