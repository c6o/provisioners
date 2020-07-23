import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace

        if (this.spec.databaseDeprovision) {
            await this.manager.cluster
                .begin('Deprovisioning the database')
                .deleteFile('../../k8s/mysql-operator.yaml', { namespace })
                .end()
        }

        if (this.spec.minioDeprovision) {
            await this.manager.cluster
                .begin('Deprovisioning minio')
                .deleteFile('../../k8s/minio-operator.yaml', { namespace })
                .end()
        }

        await this.manager.cluster
            .begin('Remove prometheus server')
                .deleteFile('../../k8s/mattermost-ingress.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-operator.yaml', { namespace })
                .deleteFile('../../k8s/mattermost-cluster.yaml', { namespace })
            .end()
    }

}