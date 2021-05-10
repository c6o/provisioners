import { baseProvisionerType } from '..'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureInstalled()
        await this.ensureReady()
    }

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'webhook'
                }
            }
        }
    }

    get clusterIssuers() {
        return {
            apiVersion: 'cert-manager.io/v1alpha2',
            kind: 'ClusterIssuer',
            metadata: {
                name: 'letsencrypt'
            }
        }
    }

    async ensureInstalled() {
        const namespace = this.serviceNamespace

        await super.cluster
            .begin('Install cert-manager services')
                .list(this.pods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        processor
                            .upsertFile('../../k8s/cert-manager.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureReady() {
        await super.cluster.
            begin('Ensure a replica is running')
                .beginWatch(this.pods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}