import { baseProvisionerType } from '../index'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {

        const namespace = this.deprovisionNamespace

        await this.manager.cluster
            .begin('Uninstall all kafka services')
            .deleteFile('../../k8s/kafka-complete.yaml', { namespace })
            .end()
    }
}