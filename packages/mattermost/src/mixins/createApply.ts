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

    isPreview = false

    async installMattermostComponents() {
        const namespace = this.serviceNamespace
        const {
            name,
            users,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize
        } = this.spec

        const edition = this.manager.document.metadata.labels['system.codezero.io/edition']

        this.isPreview = (edition === 'preview')

        if (this.isPreview) {
            await this.manager.cluster
                .begin(`Installing mattermost services (${edition} edition)`)
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
                .begin(`Installing mattermost services ('${edition}' edition.)`)
                //.list(this.mattermostClusterPods)
                .do((result, processor) => {
                    //no-op
                })
                .end()

            // await this.manager.cluster
            //     .begin('Installing mysql operator')
            //     .list(this.mattermostClusterPods)
            //     .do((result, processor) => {
            //         if (!result?.object?.items?.length) {
            //             processor
            //                 .upsertFile('../../k8s/full/1-mysql-operator.yaml')
            //         }
            //     })
            //     .end()
            await this.manager.cluster
                .begin('Install mysql operator')
                .upsertFile('../../k8s/full/1-mysql-operator.yaml')
                .end()

            // await this.manager.cluster
            //     .begin('Installing minio operator')
            //     .list(this.mattermostClusterPods)
            //     .do((result, processor) => {
            //         if (!result?.object?.items?.length) {
            //             processor
            //                 .upsertFile('../../k8s/full/2-minio-operator.yaml')
            //         }
            //     })
            //     .end()


            await this.manager.cluster
                .begin('Install minio operator')
                .upsertFile('../../k8s/full/2-minio-operator.yaml')
                .end()

            // await this.manager.cluster
            //     .begin('Installing Mattermost Operator')
            //     .list(this.mattermostClusterPods)
            //     .do((result, processor) => {
            //         if (!result?.object?.items?.length) {
            //             processor
            //                 .upsertFile('../../k8s/full/3-mattermost-operator.yaml')
            //         }
            //     })
            //     .end()

            await this.manager.cluster
                .begin('Install mattermost operator')
                .upsertFile('../../k8s/full/3-mattermost-operator.yaml')
                .end()

            // await this.manager.cluster
            //     .begin('Installing Mattermost Cluster')
            //     .list(this.mattermostClusterPods)
            //     .do((result, processor) => {
            //         if (!result?.object?.items?.length) {
            //             processor
            //                 .addOwner(this.manager.document)
            //                 .upsertFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace, name, users, mattermostLicenseSecret, databaseStorageSize, minioStorageSize })
            //         }
            //     })
            //     .end()

            await this.manager.cluster
                .begin('Install mattermost cluster')
                .upsertFile('../../k8s/full/4-mattermost-cluster.yaml', { namespace, name, users, mattermostLicenseSecret, databaseStorageSize, minioStorageSize })
                .end()
        }
    }

    async ensureMattermostIsRunning() {

        const watchPods = this.isPreview ? this.mattermostPreviewPods : this.mattermostClusterPods

        await this.manager.cluster.
            begin('Ensure Mattermost services are running')
            .beginWatch(watchPods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}