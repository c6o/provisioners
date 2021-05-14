import { baseProvisionerType } from '../index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {

        const namespace = this.controller.document.metadata.namespace

        await this.controller.cluster
            .begin('Uninstall all kafka services')
            .deleteFile('../../k8s/kafka-complete.yaml', { namespace })
            .end()
    }
}