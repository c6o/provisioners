import { baseProvisionerType } from '../'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mattermostPods() { return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mattrmost-preview'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureMattermostInstalled()
        await this.ensureMattermostIsRunning()
    }

    async ensureMattermostInstalled() {

        await this.manager.cluster
            .begin('Install Mattermost services')
            .list(this.mattermostPods)
            .do((result, processor) => {
                if (!result?.object?.items?.length) {
                    const namespace = this.serviceNamespace

                    processor
                        .addOwner(this.manager.document)
                        .upsertFile('../../k8s/preview.yaml', { namespace })
                }
            })
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