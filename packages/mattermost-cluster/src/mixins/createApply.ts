import { baseProvisionerType } from '../'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mattermostPods() { return {
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
            ingressName,
            mattermostLicenseSecret,
            databaseStorageSize,
            minioStorageSize,
            elasticHost,
            elasticUsername,
            elasticPassword
        } = this.spec


        await this.manager.cluster
            .begin('Install Mattermost Clustering services')
            .list(this.mattermostPods)
            .do((result, processor) => {})
            .end()

        await this.manager.cluster
            .begin('Install mysql operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/mysql-operator.yaml', { namespace })
            .end()


        await this.manager.cluster
            .begin('Install minio operator')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/minio-operator.yaml', { namespace })
            .end()


        await this.manager.cluster
            .begin('Install mattermost operator')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/mattermost-operator.yaml', { namespace })
        .end()


        await this.manager.cluster
            .begin('Install mattermost ingress')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/mattermost-ingress.yaml', { namespace })
        .end()


        await this.manager.cluster
            .begin('Install mattermost ingress')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/mattermost-cluster.yaml', { namespace, name, users, ingressName, mattermostLicenseSecret, databaseStorageSize, minioStorageSize, elasticHost, elasticUsername, elasticPassword })
        .end()
    }

    async ensureMattermostIsRunning() {
        await this.manager.cluster.
            begin('Ensure Mattermost services are running')
                .beginWatch(this.mattermostPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}