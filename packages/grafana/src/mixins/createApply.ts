import { baseProvisionerType } from '../index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    
    get nodeGrafanaPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'grafana'
                }
            }
        }
    }

    async createApply() {
        await this.ensureGrafanaIsInstalled()
        await this.ensureGrafanaIsRunning()
    }

    async ensureGrafanaIsInstalled() {

        const namespace = this.serviceNamespace
        const {
            storageClass,
            storage,
            adminUsername,
            adminPassword } = this.spec      

        await this.controller.cluster
            .begin('Install Grafana services')
            .list(this.nodeGrafanaPods)
            .do((result, processor) => {
    
                if (result?.object?.items?.length == 0) {
                    // There are no Grafana pods running
                    // Install Grafana
                    processor
                        .upsertFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                        .addOwner(this.controller.resource)
                        .upsertFile('../../k8s/deployment.yaml', { namespace, adminUsername, adminPassword })
                        .upsertFile('../../k8s/service.yaml', { namespace })
                }
            })
            .end()
    }
    
    /** Watches pods and ensures that a pod is running and sets runningPod */
    async ensureGrafanaIsRunning() {
        await this.controller.cluster
            .begin('Ensure a Grafana replica is running')
                .beginWatch(this.nodeGrafanaPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}