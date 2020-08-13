import { baseProvisionerType } from '../index'

const expectedCRDCount = 23

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

    get ingressPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { app: 'istio-ingressgateway' }
            }
        }
    }

    get politPod() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { app: 'pilot' }
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
        await this.ensureServiceNamespacesExist()
        await this.installCrds()
        await this.ensureCrdsApplied()
        await this.installIstioServices()
        await this.ensureIngressGatewayIsRunning()

        await this.getExternalIPAddress()
    }

    async installCrds() {
        const istioNamespace = this.spec.namespace || 'istio-system'

        await this.manager.cluster
            .begin('Install resource definitions')
                .upsertFile('../../k8s/crds.yaml', { istioNamespace })
            .end()
    }

    async installIstioServices() {
        // const sslPossible = await this.findTlsCertificate()

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

        const gatewayParams:any = {domainName: this.spec.domainName, httpsRedirect: this.spec.httpsRedirect }
        if (this.spec.hostName)
            gatewayParams.hostName = `- ${this.spec.hostName}.${this.spec.domainName}`

        await this.manager.cluster
            .begin('Install Pilot')
                .upsertFile('../../k8s/traffic.yaml', { istioNamespace, istioTrafficNamespace: istioNamespace })
            .end()

        // ensure pilot is running before install ingress gateway to reduce installation delays
        await this.ensurePilotIsRunning()

        await this.manager.cluster
            .begin('Install Ingress Gateway')
                .upsertFile('../../k8s/gateway.yaml', { istioNamespace, istioGatewayNamespace: istioNamespace })
            .end()

        if (autoInjectEnabled)
            await this.manager.cluster
                .begin('Install Auto Injection')
                    .upsertFile('../../k8s/autoinject.yaml', { istioNamespace, istioInjectNamespace: istioNamespace })
                .end()

        if (citadelEnabled)
            await this.manager.cluster
                .begin('Install Citadel')
                    .upsertFile('../../k8s/citadel.yaml', { istioNamespace, istioCitadelNamespace: istioNamespace })
                .end()

        if (coreDnsEnabled)
            await this.manager.cluster
                .begin('Install Core DNS')
                    .upsertFile('../../k8s/coredns.yaml', { istioNamespace, istioCoreDnsNamespace: istioNamespace })
                .end()

        if (galleyEnabled)
            await this.manager.cluster
                .begin('Install Galley')
                    .upsertFile('../../k8s/galley.yaml', { istioNamespace, istioGalleyNamespace: istioNamespace })
                .end()

        if (policyEnabled)
            await this.manager.cluster
                .begin('Install Policy')
                    .upsertFile('../../k8s/policy.yaml', { istioNamespace, istioPolicyNamespace: istioNamespace })
                .end()

        if (telemetryEnabled)
            await this.manager.cluster
                .begin('Install Telemetry')
                    .upsertFile('../../k8s/telemetry.yaml', { istioNamespace, istioTelemetryNamespace: istioNamespace })
                .end()

        if (grafanaEnabled)
            await this.manager.cluster
                .begin('Install Grafana')
                    .upsertFile('../../k8s/grafana.yaml', { istioNamespace })
                .end()

        if (kialiEnabled)
            await this.manager.cluster
                .begin('Install Kiali')
                    .upsertFile('../../k8s/kiali.yaml', { istioNamespace, istioPrometheusNamespace: istioNamespace })
                .end()

        if (prometheusEnabled)
            await this.manager.cluster
                .begin('Install Prometheus')
                    .upsertFile('../../k8s/prometheus.yaml', { istioNamespace, istioKialiNamespace: istioNamespace })
                .end()
    }

    async ensureCrdsApplied() {
        await this.manager.cluster
            .begin('Ensure resource definitions applied')
                .attempt(20, 2000, this.countCRDs.bind(this))
            .end()
    }

    async countCRDs(_, attempt) {
        let count = 0
        const cluster = this.manager.cluster
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

    async ensureIngressGatewayIsRunning() {
        await this.manager.cluster
            .begin(`Ensure ingress gateway is running`)
                .beginWatch(this.ingressPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }

    async ensurePilotIsRunning() {
        await this.manager.cluster
            .begin(`Ensure pilot is running`)
                .beginWatch(this.politPod)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }

    async findTlsCertificate() {
        const result = await this.manager.cluster.list(this.expectedTlsCertificate)
        return result?.object?.items?.length > 0
    }
}

