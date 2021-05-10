import { baseProvisionerType } from './index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {
        const namespace = super.document.metadata.namespace

        const replicas = this.spec.replicas || 3
        const storageClass = this.spec.storageClass || 'do-block-storage'

        const settings = {
            namespace,
            replicas,
            storageClass,
            peers: 'etcd-0=http://etcd-0.etcd:2380,etcd-1=http://etcd-1.etcd:2380,etcd-2=http://etcd-2.etcd:2380',
        }

        await super.cluster
            .begin('Uninstall etcd services')
                .deleteFile('../k8s/{version}/etcd.yaml', settings)
            .end()
    }
}