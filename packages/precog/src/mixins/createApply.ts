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

        const namespace = this.serviceNamespace
        const {
            storageClass,
            storage,
            credentials,
            edition } = this.spec

        await super.cluster
            .begin('Install PreCog services')
            .list(this.precogPods)
            .do((result, processor) => {
                if (!result?.object?.items?.length) {
                    
                    processor
                        .addOwner(super.document)
                        .upsertFile('../../k8s/secret.yaml', { namespace, credentials })
                        .upsertFile('../../k8s/basic.yaml', { namespace, image: `precog/${edition}` })
                        .clearOwners()
                        .upsertFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                }
            })
            .end()
    }

    async ensurePreCogIsRunning() {
        await super.cluster.
            begin('Ensure PreCog services are running')
                .beginWatch(this.precogPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}