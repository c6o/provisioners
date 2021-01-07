import { baseProvisionerType } from '../../'

export const hostApiMixin = (base: baseProvisionerType) => class extends base {

    async getApplicationFQDN(appName: string, namespace: string) {
        // TODO: Make this not require a namespace
        const result = await this.manager.cluster.read(this.systemServerConfigMap('c6o-system'))
        if (result.error) {
            // TODO: log failure
            return void 0
        }

        const host = result.object?.data?.HOST

        if (!host) {
            // TODO: log missing host
            return void 0
        }

        const provisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
        const prefix = await provisioner.getApplicationPrefix(appName, namespace)
        return `${prefix}.${host}`
    }



    async getApplicationURL(appName: string, namespace: string) {
        const appFQDN = await this.getApplicationFQDN(appName, namespace)
        return `https://${appFQDN}`
    }
}