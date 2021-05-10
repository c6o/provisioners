import { baseProvisionerType } from '../index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    // @ts-ignore
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

    // @ts-ignore
    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installGhost()
        await this.ensureGhostIsRunning()
    }

    // @ts-ignore
    async installGhost() {
        const namespace = this.serviceNamespace
        await this.cluster
            .begin('Install Ghost deployment')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/1-deployment.yaml', {namespace})
            .end()


        await this.cluster
            .begin('Install NodePort')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/2-service.yaml', {namespace})
            .end()
    }

    // @ts-ignore
    async ensureGhostIsRunning() {
        await this.cluster.begin('Ensure Ghost services are running')
            .beginWatch(this.ghostPods)
            .whenWatch(({condition}) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}
