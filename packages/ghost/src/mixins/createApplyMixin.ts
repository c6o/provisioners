import { baseProvisionerType } from '../index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {


    get ghostPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'ghost'
                }
            }
        }
    }

    async createApply() {
        await this.installGhost()
        await this.ensureGhostIsRunning()
    }

    async installGhost() {
        const namespace = this.serviceNamespace
        await this.controller.cluster
            .begin('Install Ghost deployment')
            .addOwner(this.controller.document)
            .upsertFile('../../k8s/latest/1-deployment.yaml', {namespace})
            .end()


        await this.controller.cluster
            .begin('Install NodePort')
            .addOwner(this.controller.document)
            .upsertFile('../../k8s/latest/2-service.yaml', {namespace})
            .end()
    }

    async ensureGhostIsRunning() {
        await this.controller.cluster.begin('Ensure Ghost services are running')
            .beginWatch(this.ghostPods)
            .whenWatch(({condition}) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}
