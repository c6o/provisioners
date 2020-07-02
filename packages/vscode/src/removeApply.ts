import { baseProvisionerType } from './index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {

        const namespace = this.manager.document.metadata.namespace
        const storageClass = this.spec.storageClass
        const storage = this.spec.storage
            
        const keepIp = this.getDeprovisionOption('keep-ip', false)
        const keepVol = this.getDeprovisionOption('keep-vol', true)

        await this.manager.cluster
            .begin('Uninstall dev services')
                .deleteFile('../k8s/configMap.yaml', { namespace })
                .deleteFile('../k8s/deployment.yaml', { namespace })
                .deleteFile('../k8s/devSvc.yaml', { namespace })
                .if(!keepIp, (processor) => processor.deleteFile('../k8s/svc.yaml', { namespace }))
                .if(!keepVol, (processor) => processor.deleteFile('../k8s/pvc.yaml', { namespace, storage, storageClass }))
            .end()
    }
}