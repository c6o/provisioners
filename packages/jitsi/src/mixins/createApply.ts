import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get jitsiPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'jitsi'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installJitsi()
        await this.ensureJitsiIsRunning()
    }

    async installJitsi() {
        const namespace = this.serviceNamespace
        const secret = Buffer.from(super.generatePassword()).toString('base64')
        const authPassword = Buffer.from(super.generatePassword()).toString('base64')
        const jvbPassword = Buffer.from(super.generatePassword()).toString('base64')
        const clusterIP = await super.getIngressGatewayServiceClusterIp()
        const tag = this.spec.tag || ':stable-5142'

        await this.manager.cluster
            .begin('Install jitsi deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/1-secret.yaml', { namespace, secret, authPassword, jvbPassword })
            .end()


        await this.manager.cluster
            .begin('Install NodePort')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/2-deployment.yaml', { namespace, clusterIP, tag })
            .end()

        await this.manager.cluster
            .begin('Install Virtual Service')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/3-webservice.yaml', { namespace })
            .end()

        await this.manager.cluster
            .begin('Install Virtual Service')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/4-service.yaml', { namespace })
            .end()

    }

    async ensureJitsiIsRunning() {
        await this.manager.cluster.
            begin('Ensure jitsi services are running')
            .beginWatch(this.jitsiPods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}