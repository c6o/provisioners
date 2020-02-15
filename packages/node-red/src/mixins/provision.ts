import { baseProvisionerType } from '..'

export const provisionMixin = (base: baseProvisionerType) => class extends base {
    
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
            .begin(`Install Node-RED services`)
                .list(this.nodeRedPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
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
        await this.manager.cluster.
            begin(`Ensure a Node-RED replica is running`)
                .beginWatch(this.nodeRedPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}