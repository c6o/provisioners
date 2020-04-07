import { baseProvisionerType } from '../index'
import { asyncForEach } from '@traxitt/common'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    
    async deprovision() {
        const namespace = this.deprovisionNamespace
    
        if (this.hasDashboards && !this.force)
            throw Error('dashboards exist, use force option to deprovision')

        await asyncForEach(this.configMaps, async (configMap) => {
            configMap.kind = 'ConfigMap'
            await this.manager.cluster.delete(configMap)
        })

        // delete the other resources
        await this.manager.cluster
            .begin('Uninstall dev services')
                .deleteFile('../../k8s/pvc.yaml', { namespace })
                .deleteFile('../../k8s/deployment.yaml', { namespace, adminUsername:'dummy', adminPassword:'dummy' })
                .deleteFile('../../k8s/service.yaml', { namespace })
            .end()
    }
}