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
                    app: 'mattermost-cluster'
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
            edition,
            ingressName,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize,
            elasticHost,
            elasticUsername,
            elasticPassword
        } = this.spec

        const isPreview = (edition === 'preview')

        console.log('///////////////////////')
        console.log(this)
        console.log('///////////////////////')
        console.log(this.spec)
        console.log('\\\\\\\\\\\\\\\\\\\\\/')

        if (isPreview) {
            await this.manager.cluster
                .begin('Install Mattermost services, preview edition.')
                .list(this.mattermostPods)
                .do((result, processor) => {
                    if (!result?.object?.items?.length) {

                        const namespace = this.serviceNamespace

                        processor
                            .addOwner(this.manager.document)
                            .upsertFile('../../k8s/preview/1. preview.yaml', { namespace, name })

                    }
                })
                .end()
        } else {

            await this.manager.cluster
                .begin('Install Mattermost Clustering services')
                .list(this.mattermostPods)
                .do()
                .end()

            await this.manager.cluster
                .begin('Install mysql operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/1. mysql-operator.yaml', { namespace, name })
                .end()

            await this.manager.cluster
                .begin('Install minio operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/2. minio-operator.yaml', { namespace, name })
                .end()

            await this.manager.cluster
                .begin('Install mattermost operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/3. mattermost-operator.yaml', { namespace, name })
                .end()

            await this.manager.cluster
                .begin('Install mattermost ingress')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/4. mattermost-cluster.yaml', { namespace, name, users, ingressName, mattermostLicenseSecret, databaseStorageSize, minioStorageSize, elasticHost, elasticUsername, elasticPassword })
                .end()
        }
    }

    async ensureMattermostIsRunning() {

        const watchPods = this.spec.edition === 'preview' ? this.mattermostPreviewPods : this.mattermostClusterPods

        await this.manager.cluster.
            begin('Ensure Mattermost services are running')
            .beginWatch(watchPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}