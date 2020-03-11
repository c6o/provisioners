import { baseProvisionerType } from '..'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

export const provisionMixin = (base: baseProvisionerType) => class extends base {
    
    async provision() {
        debug('About to install cert-manager provisioner.')
        await this.ensureServiceNamespacesExist()
        await this.ensureInstalled()
        await this.ensureReady()
        await this.ensureCertificate()
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

        await this.manager.cluster
            .begin(`Install cert-manager services`)
                .list(this.pods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('cert-manager installing.')
                        processor
                            .upsertFile('../../k8s/deployment.yaml', { namespace })                            
                    }
                })
            .end()

        debug('Finished installing cert-manager.')
    }

    async ensureReady() {
        await this.manager.cluster.
            begin(`Ensure a replica is running`)
                .beginWatch(this.pods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()

        debug('cert-manager now ready.')
    }

    async ensureCertificate() {
        debug('About to issue certificate.')
        const staging = this.spec.staging || '-staging'
        const notifyEmail = this.spec.notifyEmail || 'grant@burnard.com'
        const namespace = this.serviceNamespace

        await this.manager.cluster
            .begin(`Install cert-manager cluster issuer`)
                .list(this.clusterIssuers)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('Certificate issuer installing.')
                        processor
                            .upsertFile('../../k8s/cluster-issuer.yaml', { namespace, staging, notifyEmail })                            
                    }
                })
            .end()

        debug('Certificate issuer installed.')
    }
}