import { baseProvisionerType } from '../index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace

        // TODO: this needs more work since the preview may have been installed
        await this.manager.cluster
            .begin('Deprovisioning the app')
                .deleteFile('../../k8s/full/1-mysql-operator.yaml')
                .deleteFile('../../k8s/full/2-minio-operator.yaml')
                .deleteFile('../../k8s/full/3-mattermost-operator.yaml')
                .deleteFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace })
            .end()
    }
}