import { baseProvisionerType } from '../'

export const provisionMixin = (base: baseProvisionerType) => class extends base {

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

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureVerdaccioInstalled()
        await this.ensureVerdaccioIsRunning()
    }

    async ensureVerdaccioInstalled() {

        await this.manager.cluster
            .begin('Install verdaccio services')
            .list(this.verdaccioPods)
            .do((result, processor) => {
                if (result?.object?.items?.length) {
                    const namespace = this.serviceNamespace

                    processor
                        .upsertFile('../../k8s/helm.yaml', { namespace })
                }
            })
            .end()
    }

    async ensureVerdaccioIsRunning() {
        await this.manager.cluster.
            begin('Ensure verdaccio services are running')
                .beginWatch(this.verdaccioPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}