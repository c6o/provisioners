import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const namespace = this.manager.document.metadata.namespace
        const storageClass = this.spec.storageClass
        const storage = this.spec.storage || '2Gi'
        const adminUsername = this.spec.adminUsername || 'admin'
        const adminPassword = this.spec.adminPassword
        const hostname = this.spec.hostname || false
            
        await this.manager.cluster
            .begin('Uninstall NextCloud services')
                .deleteFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                .deleteFile('../../k8s/secrets.yaml', { namespace, adminUsername, adminPassword })
                .deleteFile('../../k8s/deployment.yaml', { namespace, hostname })
                .deleteFile('../../k8s/service.yaml', { namespace })
            .end()
    }
}