import { baseProvisionerType } from '../index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {

        const namespace = super.document.metadata.namespace

        await super.cluster
            .begin('Uninstall all kafka services')
            .deleteFile('../../k8s/kafka-complete.yaml', { namespace })
            .end()
    }
}