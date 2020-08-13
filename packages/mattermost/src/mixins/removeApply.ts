import { baseProvisionerType } from '../index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace
        const name = this.spec.name

        // TODO: Remove any MySqlCluster resource and wait until they are terminated
        // It is then safe to remove the following
        // You may not have to remove the following because owners takes care of most of it
        await this.manager.cluster
            .begin('De-provisioning the app')
                .deleteFile('../../k8s/preview/preview.yaml', { namespace, name })
                .deleteFile('../../k8s/full/1-mysql-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/2-minio-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/3-mattermost-operator.yaml', { namespace })
                .deleteFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace })
            .end()
    }
}