import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('nginx:createApply:')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installApp()
        await this.ensureAppIsrunning()
    }

    get nginxPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'nginx'
                }
            }
        }
    }

    async installApp() {
        const namespace = this.serviceNamespace
        await this.manager.cluster
            .begin('Install app')
                .list(this.nginxPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('Performing installation')
                        processor
                            .upsertFile('../../k8s/deployment.yaml', { namespace })
                            .upsertFile('../../k8s/service.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureAppIsrunning() {
        debug('Ensuring app is running')
        await this.manager.cluster
            .begin('Ensure app  is running')
                .beginWatch(this.nginxPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}