import { baseProvisionerType } from '../'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get simpleServiceProvided() { return !!(this.spec.simpleService || this.options.simple) }

    get alertManagerEnabledProvided() { return !!(this.spec.alertManagerEnabled || this.options.alertManager) }

    get kubeMetricsEnabledProvided() { return !!(this.spec.kubeMetricsEnabled || this.options.kubeMetrics) }

    get nodeExporterEnabledProvided() { return !!(this.spec.nodeExporterEnabled || this.options.nodeExporter) }

    get pushGatewayEnabledProvided() { return !!(this.spec.simpleService || this.options.simple) }

    async preprovision() {

        if (!this.simpleServiceProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'simpleService',
                default: false,
                message: 'Provision simple prometheus service?',
            })

            this.spec.simpleService = response?.simpleService || false
        }
        if (this.spec.simpleService)
            return

        if (!this.alertManagerEnabledProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'alertManagerEnabled',
                default: false,
                message: 'Include alert manager?',
            })

            this.spec.alertManagerEnabled = response?.alertManagerEnabled || false
        }

        if (!this.kubeMetricsEnabledProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'kubeMetricsEnabled',
                default: false,
                message: 'Include kube metrics?',
            })

            this.spec.kubeMetricsEnabled = response?.kubeMetricsEnabled || false
        }

        if (!this.nodeExporterEnabledProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'nodeExporterEnabled',
                default: false,
                message: 'Include node exporter?',
            })

            this.spec.nodeExporterEnabled = response?.nodeExporterEnabled || false
        }

        if (!this.pushGatewayEnabledProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'pushGatewayEnabled',
                default: false,
                message: 'Include push gateway?',
            })

            this.spec.pushGatewayEnabled = response?.pushGatewayEnabled || false
        }
    }
}
