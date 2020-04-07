import { baseProvisionerType } from '../index'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    dashboardConfigMap(namespace: string) {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace,
                labels: {
                    'system.traxitt.com/managed-by': 'grafana'
                }
            }
        }
    }

    async predeprovision() {
        const namespace = this.deprovisionNamespace

        const result = await this.manager.cluster.list(this.dashboardConfigMap(namespace))
        this.hasDashboards = false
        this.configMaps = []
        if (!result.error) {
            this.hasDashboards = result.object?.items?.length ? true : false
            this.configMaps = result.object?.items
        }

        // if we have dashboards, we must force to complete deprovisioning
        if (this.hasDashboards && !this.providedDeprovisionOption('force')) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'force',
                default: false,
                message: 'You have dashboards added by another application, force deprovisioning?',
            })
            if (response)
                this.force = response.force
        } else
            this.force = this.getDeprovisionOption('force', false)

    }
}