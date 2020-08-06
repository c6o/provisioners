import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace
        await this.manager.cluster
            .begin('Uninstall app')
                .deleteFile('../../k8s/service.yaml', { namespace })
                .deleteFile('../../k8s/deployment.yaml', { namespace })
            .end()
    }
}