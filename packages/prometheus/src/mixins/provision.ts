import { baseProvisionerType } from '..'

export const provisionMixin = (base: baseProvisionerType) => class extends base {
    
    async provision() {
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
            await this.manager.cluster
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

        await this.manager.cluster
            .begin('Install prometheus server')
                .upsertFile('../../k8s/prometheus-server.yaml', { namespace })
            .end()

        if (alertManagerEnabled) {
            await this.manager.cluster
                .begin('Install alert manager')
                    .upsertFile('../../k8s/prometheus-alertmanager.yaml', { namespace })
                .end()
        }

        if (kubeMetricsEnabled) {
            await this.manager.cluster
                .begin('Install kube state metrics components')
                    .upsertFile('../../k8s/prometheus-kubemetrics.yaml', { namespace })
                .end()
        }

        if (nodeExporterEnabled) {
            await this.manager.cluster
                .begin('Install node exporter')
                    .upsertFile('../../k8s/prometheus-nodeexporter.yaml', { namespace })
                .end()
        }

        if (pushGatewayEnabled) {
            await this.manager.cluster
                .begin('Install push gateway components')
                    .upsertFile('../../k8s/prometheus-pushgateway.yaml', { namespace })
                .end()
        }
    }
    
    async ensurePrometheusIsRunning() {
        await this.manager.cluster.
            begin('Ensure Prometheus server is running')
                .beginWatch(this.prometheusPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}