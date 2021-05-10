import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const namespace = super.document.metadata.namespace
        const storage = this.spec.storage || '1Gi'
        const storageClass = this.spec.storageClass
        const k8sLogIndexPrefix = this.spec.k8sLogIndexPrefix || 'cloud'
    
        await super.cluster
            .begin('Uninstall logging services')
                .deleteFile('../../k8s/kibana.yaml', { namespace })
                .deleteFile('../../k8s/fluentd.yaml', { namespace, k8sLogIndexPrefix })
                .deleteFile('../../k8s/elasticsearch.yaml', { namespace, storage, storageClass })
            .end()
    }
}