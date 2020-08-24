import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'
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
        await this.ensureServiceNamespacesExist()
        await this.installGhost()
        await this.ensureGhostIsRunning()
    }

    async installGhost() {
        const namespace = this.serviceNamespace
        await this.manager.cluster
            .begin('Install Ghost deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/1-deployment.yaml', { namespace })
            .end()


        await this.manager.cluster
            .begin('Install NodePort')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/2-service.yaml', { namespace })
            .end()

        // await this.manager.cluster
        //     .begin('Install Virtual Service')
        //     .addOwner(this.manager.document)
        //     .upsertFile('../../k8s/latest/3-virtualservice.yaml', { namespace })
        //     .end()

    }

    async ensureGhostIsRunning() {
        await this.manager.cluster.
            begin('Ensure Ghost services are running')
            .beginWatch(this.ghostPods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}