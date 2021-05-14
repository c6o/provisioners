import { baseProvisionerType } from '../'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // protected members
    runningPod

    get verdaccioPods() { return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'verdaccio'
                }
            }
        }
    }

    async createApply() {
        await this.ensureVerdaccioInstalled()
        await this.ensureVerdaccioIsRunning()
    }

    async ensureVerdaccioInstalled() {

        await this.controller.cluster
            .begin('Install verdaccio services')
            .list(this.verdaccioPods)
            .do((result, processor) => {
                if (!result?.object?.items?.length) {
                    
                    const namespace = this.serviceNamespace
                    const {
                        storageClass } = this.spec

                    processor
                        .addOwner(this.controller.resource)
                        .upsertFile('../../k8s/helm.yaml', { namespace, storageClass })
                        .clearOwners()
                        .upsertFile('../../k8s/pvc.yaml', { namespace })
                }
            })
            .end()
    }

    async ensureVerdaccioIsRunning() {
        await this.controller.cluster.
            begin('Ensure verdaccio services are running')
                .beginWatch(this.verdaccioPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}