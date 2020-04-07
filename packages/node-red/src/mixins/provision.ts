import { baseProvisionerType } from '../index'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

export const provisionMixin = (base: baseProvisionerType) => class extends base {
    istioProvisioner
    
    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureNodeRedIsInstalled()
        await this.ensureNodeRedIsRunning()
    }

    get nodeRedPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'node-red'
                }
            }
        }
    }

    async ensureNodeRedIsInstalled() {

        const storage = this.spec.storage
        const projects = this.spec.projects
        const namespace = this.serviceNamespace

        await this.manager.cluster
            .begin('Install Node-RED services')
                .list(this.nodeRedPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('Installing Node-Red')
                        // There are no node-red pods running
                        // Install node-red
                        processor
                            .upsertFile('../../k8s/pvc.yaml', { namespace, storage })
                            .upsertFile('../../k8s/deployment.yaml', { namespace, projects })
                            .upsertFile('../../k8s/service.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureNodeRedIsRunning() {
        debug('Ensuring Node-Red is running')
        await this.manager.cluster.
            begin('Ensure a Node-RED replica is running')
                .beginWatch(this.nodeRedPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}