import { baseProvisionerType } from '../index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mattermostPreviewPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mattermost-preview'
                }
            }
        }
    }

    get mattermostClusterPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mattermost'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installMattermostComponents()
        await this.ensureMattermostIsRunning()
    }

    async installMattermostComponents() {
        const namespace = this.serviceNamespace
        const {
            name,
            users,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize
        } = this.spec

        let edition = this.manager.document.metadata.labels['system.codezero.io/edition']
        if (!edition && this.spec.edition)
            edition = this.spec.edition
        const isPreview = (edition === 'preview')

        if (isPreview) {
            await this.manager.cluster
                .begin(`Install Mattermost services (${edition} edition)`)
                .list(this.mattermostPreviewPods)
                .do((result, processor) => {
                    if (!result?.object?.items?.length) {
                        processor
                            .addOwner(this.manager.document)
                            .upsertFile('../../k8s/preview/preview.yaml', { namespace, name })
                    }
                })
                .end()
        } else {
            await this.manager.cluster
                .begin(`Install Mattermost services (${edition} edition)`)
                    .list(this.mattermostClusterPods)
                    .do((result, processor) => {
                        if (!result?.object?.items?.length) {
                            processor
                                .upsertFile('../../k8s/full/1-mysql-operator.yaml')
                                .upsertFile('../../k8s/full/2-minio-operator.yaml')
                                .upsertFile('../../k8s/full/3-mattermost-operator.yaml')
                                .upsertFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace, name, users, mattermostLicenseSecret, databaseStorageSize, minioStorageSize })
                        }
                    })
                .end()
        }
    }

    async ensureMattermostIsRunning() {
        const watchPods = this.spec.isPreview ? this.mattermostPreviewPods : this.mattermostClusterPods

        await this.manager.cluster.
            begin('Ensure Mattermost services are running')
                .beginWatch(watchPods)
                .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}