import { baseProvisionerType } from './index'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {

        const namespace = this.deprovisionNamespace
    
        await this.manager.cluster
            .begin('Uninstall dev services')
                .deleteFile('../k8s/deployment.yaml', { namespace })
                .deleteFile('../k8s/devSvc.yaml', { namespace })
                .if(!this.keepIp, (processor) => processor.deleteFile('../k8s/svc.yaml', { namespace }))
                .if(!this.keepVolume, (processor) => processor.deleteFile('../k8s/pvc.yaml', { namespace }))
            .end()
    }
}