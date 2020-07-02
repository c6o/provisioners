import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const namespace = this.manager.document.metadata.namespace
        const storageClass = this.spec.storageClass
        const storage = this.spec.storage || '2Gi'
        const projects = this.spec.projects || false
            
        await this.manager.cluster
            .begin('Uninstall Node-RED services')
                .deleteFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                .deleteFile('../../k8s/deployment.yaml', { namespace, projects })
                .deleteFile('../../k8s/service.yaml', { namespace })
            .end()
    }
}