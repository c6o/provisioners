import { baseProvisionerType } from '../../'

export const httpsRedirectApiMixin = (base: baseProvisionerType) => class extends base {
    'https-redirect' = {
        find: async () => {
            const result = await this.findGateway()
            if (result.error)
                return result.error
            return {enable: result.object?.spec?.servers?.[0]?.tls?.httpsRedirect}
        },

        create: async (data) => {
            const result = await this.setHttpsRedirect(data.enable)
            return result.object || result.error
        }
    }

    traxittGateway = {
        apiVersion: 'networking.istio.io/v1alpha3',
        kind: 'Gateway',
        metadata: {
            name: 'traxitt-system-marina-gateway',
            namespace: 'istio-system'
        }
    }

    async findGateway() {
        return await this.manager.cluster.read(this.traxittGateway)
    }

    async setHttpsRedirect(enable) {
        return await this.manager.cluster.patch(this.traxittGateway, [{ 'op': 'replace', 'path': '/spec/servers/0/tls/httpsRedirect', 'value': enable}])
    }
}