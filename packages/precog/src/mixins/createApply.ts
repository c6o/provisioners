import { baseProvisionerType } from '../'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod

    get precogPods() { return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'precog'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensurePreCogInstalled()
        await this.ensurePreCogIsRunning()
    }

    async ensurePreCogInstalled() {

        await this.manager.cluster
            .begin('Install PreCog services')
            .list(this.precogPods)
            .do((result, processor) => {
                if (!result?.object?.items?.length) {
                    const namespace = this.serviceNamespace

                    processor
                        .upsertFile('../../k8s/secret.yaml', { namespace, credentials: this.spec.credentials })
                        .upsertFile('../../k8s/basic.yaml', { namespace, storage: this.spec.storage, image: `precog/${this.spec.edition}` })
                }
            })
            .end()
    }

    async ensurePreCogIsRunning() {
        await this.manager.cluster.
            begin('Ensure PreCog services are running')
                .beginWatch(this.precogPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}