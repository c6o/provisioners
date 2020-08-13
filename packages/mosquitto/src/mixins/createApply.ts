import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mosquittoPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mosquitto'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installMosquitto()
        await this.ensureMosquittoIsRunning()
    }

    async installMosquitto() {
        const namespace = this.serviceNamespace

        await this.manager.cluster
            .begin('Install mosquitto deployment')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/1-deployment.yaml', { namespace })
            .end()


        await this.manager.cluster
            .begin('Install NodePort')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/2-nodeport.yaml', { namespace })
            .end()

        await this.manager.cluster
            .begin('Install Virtual Service')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/3-virtualservice.yaml', { namespace })
            .end()

    }

    async ensureMosquittoIsRunning() {
        await this.manager.cluster.
            begin('Ensure mosquitto services are running')
                .beginWatch(this.mosquittoPods)
                .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}