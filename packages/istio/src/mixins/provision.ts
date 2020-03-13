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
        const istioNamespace = this.spec.namespace || 'istio-system'

        await this.manager.cluster
            .begin(`Install istio resource definitions`)
                .upsertFile('../../k8s/crds.yaml', { istioNamespace })
            .end()
    }

    async installIstioServices() {
        const istioNamespace = this.spec.namespace || 'istio-system'

        const { autoInjectEnabled,
            citadelEnabled,
            coreDnsEnabled,
            galleyEnabled,
            policyEnabled,
            telemetryEnabled,
            grafanaEnabled,
            kialiEnabled,
            prometheusEnabled
        } = this.spec

        const gatewayParams:any = {domainName: this.spec.domainName, httpsRedirect: this.spec.httpsRedirect}
        if (this.spec.hostName)
            gatewayParams.hostName = `- ${this.spec.hostName}.${this.spec.domainName}`

        await this.manager.cluster
            .begin(`Install istio base and minimal`)
                .upsertFile('../../k8s/gateway.yaml', { istioNamespace, istioGatewayNamespace: istioNamespace })
                .upsertFile('../../k8s/traffic.yaml', { istioNamespace, istioTrafficNamespace: istioNamespace })
                .upsertFile('../../k8s/gateway-template.yaml', gatewayParams)
            .end()

        if (autoInjectEnabled)
            await this.manager.cluster
                .begin(`Install Istio Auto Injection`)
                    .upsertFile('../../k8s/autoinject.yaml', { istioNamespace, istioInjectNamespace: istioNamespace })
                .end()

        if (citadelEnabled)
            await this.manager.cluster
                .begin(`Install Istio Citadel`)
                    .upsertFile('../../k8s/citadel.yaml', { istioNamespace, istioCitadelNamespace: istioNamespace })
                .end()

        if (coreDnsEnabled)
            await this.manager.cluster
                .begin(`Install Istio Core DNS`)
                    .upsertFile('../../k8s/coredns.yaml', { istioNamespace, istioCoreDnsNamespace: istioNamespace })
                .end()

        if (galleyEnabled)
            await this.manager.cluster
                .begin(`Install Istio Galley`)
                    .upsertFile('../../k8s/galley.yaml', { istioNamespace, istioGalleyNamespace: istioNamespace })
                .end()

        if (policyEnabled)
            await this.manager.cluster
                .begin(`Install Istio Policy`)
                    .upsertFile('../../k8s/policy.yaml', { istioNamespace, istioPolicyNamespace: istioNamespace })
                .end()

        if (telemetryEnabled)
            await this.manager.cluster
                .begin(`Install Istio Telemetry`)
                    .upsertFile('../../k8s/telemetry.yaml', { istioNamespace, istioTelemetryNamespace: istioNamespace })
                .end()

        if (grafanaEnabled)
            await this.manager.cluster
                .begin(`Install grafana`)
                    .upsertFile('../../k8s/grafana.yaml', { istioNamespace, istioGrafanaNamespace: istioNamespace })
                .end()

        if (kialiEnabled)
            await this.manager.cluster
                .begin(`Install kiali`)
                    .upsertFile('../../k8s/kiali.yaml', { istioNamespace, istioPrometheusNamespace: istioNamespace })
                .end()

        if (prometheusEnabled)
            await this.manager.cluster
                .begin(`Install prometheus`)
                    .upsertFile('../../k8s/prometheus.yaml', { istioNamespace, istioKialiNamespace: istioNamespace })
                .end()
    }

    async ensureCrdsApplied() {
        await this.manager.cluster
            .begin(`Ensure istio CRDs applied`)
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

