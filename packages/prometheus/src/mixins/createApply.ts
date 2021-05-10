import { baseProvisionerType } from '..'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    
    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installPrometheusComponents()
        await this.ensurePrometheusIsRunning()
    }

    get prometheusPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'prometheus-server'
                }
            }
        }
    }

    async installPrometheusComponents() {

        const namespace = this.serviceNamespace
        const {
            simpleService,
            alertManagerEnabled,
            kubeMetricsEnabled,
            nodeExporterEnabled,
            pushGatewayEnabled
        } = this.spec

        if (simpleService) {
            await this.cluster
                .begin('Install simple prometheus services')
                    .list(this.prometheusPods)
                    .do((result, processor) => {
                        if (result?.object?.items?.length == 0) {
                            processor
                                .upsertFile('../../k8s/prometheus-simple-cm.yaml', { namespace })
                                .upsertFile('../../k8s/prometheus-simple.yaml', { namespace })
                        }
                    })
                .end()
            return
        }

        await this.cluster
            .begin('Install prometheus server')
                .upsertFile('../../k8s/prometheus-server.yaml', { namespace })
                .upsertFile('../../k8s/prometheus-configmap.yaml', { namespace })
            .end()

        if (alertManagerEnabled) {
            await this.cluster
                .begin('Install alert manager')
                    .upsertFile('../../k8s/prometheus-alertmanager.yaml', { namespace })
                .end()
        }

        if (kubeMetricsEnabled) {
            await this.cluster
                .begin('Install kube state metrics components')
                    .upsertFile('../../k8s/prometheus-kubemetrics.yaml', { namespace })
                .end()
        }

        if (nodeExporterEnabled) {
            await this.cluster
                .begin('Install node exporter')
                    .upsertFile('../../k8s/prometheus-nodeexporter.yaml', { namespace })
                .end()
        }

        if (pushGatewayEnabled) {
            await this.cluster
                .begin('Install push gateway components')
                    .upsertFile('../../k8s/prometheus-pushgateway.yaml', { namespace })
                .end()
        }
    }
    
    async ensurePrometheusIsRunning() {
        await this.cluster.
            begin('Ensure Prometheus server is running')
                .beginWatch(this.prometheusPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}