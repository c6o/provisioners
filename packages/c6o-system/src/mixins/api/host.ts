import { baseProvisionerType } from '../../'

export const hostApiMixin = (base: baseProvisionerType) => class extends base {

    async getSystemFQDN() {
        const result = await this.manager.cluster.read(this.systemServerConfigMap('c6o-system'))
        if (result.error)
            throw result.error

        const host = result.object?.data?.HOST
        if (!host)
            throw new Error('HOST not found')
        return host
    }

    async getApplicationFQDN(appName: string, namespace: string) {
        const host = await this.getSystemFQDN()

        const provisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
        const prefix = await provisioner.getApplicationPrefix(appName, namespace)
        return `${prefix}.${host}`
    }



    async getApplicationURL(appName: string, namespace: string) {
        const appFQDN = await this.getApplicationFQDN(appName, namespace)
        return `https://${appFQDN}`
    }
}