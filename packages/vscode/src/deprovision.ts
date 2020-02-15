import { baseProvisionerType } from './index'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {
        this.ensureServiceNamespacesExist()

        const namespace = this.serviceNamespace
        const keepIp = this.options['keep-ip']
        const keepVol = this.options['keep-vol']
    
        await this.manager.cluster
            .begin(`Uninstall dev services`)
                .deleteFile('../k8s/deployment.yaml', { namespace })
                .deleteFile('../k8s/devSvc.yaml', { namespace })
                .if(!keepIp, (processor) => processor.deleteFile('../k8s/svc.yaml', { namespace }))
                .if(!keepVol, (processor) => processor.deleteFile('../k8s/pvc.yaml', { namespace }))
            .end()
    }
}