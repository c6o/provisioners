import { baseProvisionerType } from '../'

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
            ingressName,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize,
            elasticHost,
            elasticUsername,
            elasticPassword,
            edition,
            isPreview
        } = this.spec

        if (isPreview) {
            await this.manager.cluster
                .begin(`Install Mattermost services, '${edition}' edition.`)
                .list(this.mattermostPreviewPods)
                .do((result, processor) => {
                    if (!result?.object?.items?.length) {
                        processor
                            .addOwner(this.manager.document)
                            .upsertFile('../../k8s/preview/1. preview.yaml', { namespace, name })
                    }
                })
                .end()
        } else {

            await this.manager.cluster
                .begin(`Install Mattermost services, '${edition}' edition.`)
                .list(this.mattermostClusterPods)
                .do((result, processor) => {
                    //no-op
                    })
                .end()

            await this.manager.cluster
                .begin('Install mysql operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/1. mysql-operator.yaml')
                .end()

            await this.manager.cluster
                .begin('Install minio operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/2. minio-operator.yaml')
                .end()

            await this.manager.cluster
                .begin('Install mattermost operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/3. mattermost-operator.yaml')
                .end()

            await this.manager.cluster
                .begin('Install mattermost ingress')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/4. mattermost-cluster.yaml', { namespace, name, users, ingressName, mattermostLicenseSecret, databaseStorageSize, minioStorageSize, elasticHost, elasticUsername, elasticPassword })
                .end()


        }
    }

    async ensureMattermostIsRunning() {

        const watchPods = this.spec.isPreview ? this.mattermostPreviewPods : this.mattermostClusterPods

        await this.manager.cluster.
            begin('Ensure Mattermost services are running')
            .beginWatch(watchPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}