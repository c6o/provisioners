import { baseProvisionerType } from '../'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    simpleServiceProvided(answers) { return !!(this.spec.simpleService || answers.simple) }

    alertManagerEnabledProvided(answers) { return !!(this.spec.alertManagerEnabled || answers.alertManager) }

    kubeMetricsEnabledProvided(answers) { return !!(this.spec.kubeMetricsEnabled || answers.kubeMetrics) }

    nodeExporterEnabledProvided(answers) { return !!(this.spec.nodeExporterEnabled || answers.nodeExporter) }

    pushGatewayEnabledProvided(answers) { return !!(this.spec.simpleService || answers.simple) }

    async createInquire(answers) {

        if (!this.simpleServiceProvided(answers)) {
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

        if (!this.alertManagerEnabledProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'alertManagerEnabled',
                default: false,
                message: 'Include alert manager?',
            })

            this.spec.alertManagerEnabled = response?.alertManagerEnabled || false
        }

        if (!this.kubeMetricsEnabledProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'kubeMetricsEnabled',
                default: false,
                message: 'Include kube metrics?',
            })

            this.spec.kubeMetricsEnabled = response?.kubeMetricsEnabled || false
        }

        if (!this.nodeExporterEnabledProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'nodeExporterEnabled',
                default: false,
                message: 'Include node exporter?',
            })

            this.spec.nodeExporterEnabled = response?.nodeExporterEnabled || false
        }

        if (!this.pushGatewayEnabledProvided(answers)) {
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
