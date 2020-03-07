import { baseProvisionerType } from '../index'
import { createDebug } from '@traxitt/common'

const debug = createDebug()
const expectedCRDCount = 23

export const provisionMixin = (base: baseProvisionerType) => class extends base {

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

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.installCrds()
        await this.ensureCrdsApplied()
        await this.installIstioServices()
    }

    async installCrds() {
        debug('Installing Istio CRDs')

        await this.manager.cluster
            .begin(`Install istio resource definitions`)
                .upsertFile('../../k8s/crds.yaml')
            .end()
    }

    async installIstioServices() {
        const ingressEnabled = !!this.spec.ingressEnabled
        const citadelEnabled = !!this.spec.citadelEnabled
        const telemetryEnabled = !!this.spec.telemetryEnabled
        const grafanaEnabled = !!this.spec.grafanaEnabled
        const kialiEnabled = !!this.spec.kialiEnabled
        const prometheusEnabled = !!this.spec.prometheusEnabled

        // TODO: use the grafana provisioner for grafana - just add to app
        const grafanaAdminUsername = this.spec.grafanaAdminUsername || 'admin'
        const grafanaAdminPassword = this.spec.grafanaAdminPassword || 'admin'

        debug('Installing Istio base')
        await this.manager.cluster
            .begin(`Install istio minimal`)
                .upsertFile('../../k8s/istio-minimal.yaml')
            .end()

        if (ingressEnabled) {
            debug('Installing Istio Ingress')
            await this.manager.cluster
                .begin(`Install istio ingress`)
                    .upsertFile('../../k8s/ingress.yaml')
                .end()
        }
        if (citadelEnabled) {
            debug('Installing Istio Citadel')
            await this.manager.cluster
                .begin(`Install citadel`)
                    .upsertFile('../../k8s/citadel.yaml')
                .end()
        }
        if (telemetryEnabled) {
            debug('Installing Istio Telemetry')
            await this.manager.cluster
                .begin(`Install telemetry`)
                    .upsertFile('../../k8s/telemetry.yaml')
                .end()
        }
        if (grafanaEnabled) {
            debug('Installing Istio Grafana')
            await this.manager.cluster
                .begin(`Install grafana`)
                    .upsertFile('../../k8s/grafana.yaml')
                .end()
        }
        if (kialiEnabled) {
            debug('Installing Istio Kiali')
            await this.manager.cluster
                .begin(`Install kiali`)
                    .upsertFile('../../k8s/kiali.yaml')
                .end()
        }
        if (prometheusEnabled) {
            debug('Installing Istio Prometheus')
            await this.manager.cluster
                .begin(`Install prometheus`)
                    .upsertFile('../../k8s/prometheus.yaml')
                .end()
        }
    }

    async ensureCrdsApplied() {
        await this.manager.cluster
            .begin(`Ensure istio resource definitions applied`)
                .attempt(20, 2000, this.countCRDs.bind(this))
            .end()
    }

    async countCRDs(processor, attempt) {
        let count = 0
        const cluster = this.manager.cluster
        await cluster
            .begin()
                .list(this.crdDocument)
                .do((result, processor) => {
                    count = result?.object?.items?.length
                })
            .end()

        cluster.status?.log(`Retrieved ${count} out of ${expectedCRDCount} CRDs attempt ${attempt}`)
        return count >= expectedCRDCount
    }
}

