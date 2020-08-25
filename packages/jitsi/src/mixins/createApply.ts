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

    async getIngressGatewayService() {
        const service = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                namespace: 'istio-system',
                name: 'istio-ingressgateway', // constants?
                labels: {
                    app: 'istio-ingressgateway'
                }
            }
        }
        const result = await this.manager.cluster.read(service)

        if (result.error) {
            this.logger?.error(result.error)
            throw result.error
        }
        return result.object
    }

    async installJitsi() {
        const namespace = this.serviceNamespace

        const {
            secret,
            authPassword,
            jvbPassword,
        } = this.spec

        const secret64 = Buffer.from(secret).toString('base64')
        const authPassword64 = Buffer.from(authPassword).toString('base64')
        const jvbPassword64 = Buffer.from(jvbPassword).toString('base64')
        const gateway = await this.getIngressGatewayService()

        const clusterip = gateway.spec.clusterIP

        await this.manager.cluster
            .begin('Install jitsi deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/1-secret.yaml', { namespace, secret: secret64, authPassword: authPassword64, jvbPassword: jvbPassword64 })
            .end()


        await this.manager.cluster
            .begin('Install NodePort')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/2-deployment.yaml', { namespace, clusterip })
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