import { baseProvisionerType } from '../index'

const expectedCRDCount = 25

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get crdDocument() {
        return {
            apiVersion: 'apiextensions.k8s.io/v1beta1',
            kind: 'CustomResourceDefinition',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    release: 'istio'
                }
            }
        }
    }

    get ingressPod() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { istio: 'ingressgateway' }
            }
        }
    }

    get istiodPod() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { istio: 'pilot' }
            }
        }
    }

    get expectedTlsCertificate() {
        return {
            apiVersion: 'v1',
            kind: 'Secret',
            type: 'kubernetes.io/tls',
            metadata: {
                name: 'c6o-system-certificate-tls',
                namespace: 'cert-manager'
            }
        }
    }

    async createApply() {
        await this.installCrds()
        await this.ensureCrdsApplied()
        await this.installIstioServices()
        await this.getExternalAddress()
    }

    async installCrds() {
        await this.controller.cluster
            .begin('Install resource definitions')
                .upsertFile('../../k8s/crds.yaml')
            .end()
    }

    async installIstioServices() {
        await this.controller.cluster
            .begin('Install Istiod')
                .upsertFile('../../k8s/traffic.yaml')
            .end()

        // ensure istiod is running before install ingress gateway to reduce installation delays
        await this.ensureIstiodIsRunning()

        await this.controller.cluster
            .begin('Install Ingress Gateway')
                .upsertFile('../../k8s/gateway.yaml')
            .end()

        await this.ensureIngressIsRunning()
    }

    async ensureCrdsApplied() {
        await this.controller.cluster
            .begin('Ensure resource definitions applied')
                .attempt(20, 2000, this.countCRDs.bind(this))
            .end()
    }

    async countCRDs(_, attempt) {
        let count = 0
        const cluster = this.controller.cluster
        await cluster
            .begin()
                .list(this.crdDocument)
                .do((result) => {
                    count = result?.object?.items?.length
                })
            .end()

        cluster.status?.info(`Retrieved ${count} out of ${expectedCRDCount} CRDs attempt ${attempt}`)
        return count >= expectedCRDCount
    }

    async ensureIngressIsRunning() {
        await this.controller.cluster
            .begin(`Ensure ingress gateway is running`)
                .beginWatch(this.ingressPod)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }

    async ensureIstiodIsRunning() {
        await this.controller.cluster
            .begin(`Ensure istiod is running`)
                .beginWatch(this.istiodPod)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}