import { baseProvisionerType } from '../'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {

        // TODO: delete the persistent volume claim on signal?
        // const namespace = this.manager.document.metadata.namespace
        //
        // const replicas = this.spec.replicas || 3
        // const storageClass = this.spec.storageClass || 'do-block-storage'
        //
        // const settings = {
        //     namespace,
        //     replicas,
        //     storageClass,
        // }
        //
        // await this.manager.cluster
        //     .begin('Uninstall app services')
        //     .deleteFile('', settings)
        //     .end()
    }
}