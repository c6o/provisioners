import { baseProvisionerType } from '../index'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    dashboardConfigMap(namespace: string) {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace,
                labels: {
                    'system.codezero.io/managed-by': 'grafana'
                }
            }
        }
    }

    async removeInquire(answers) {
        const namespace = this.manager.document.metadata.namespace

        const result = await this.manager.cluster.list(this.dashboardConfigMap(namespace))
        let hasDashboards = false
        if (!result.error)
            hasDashboards = result.object?.items?.length ? true : false

        // if we have dashboards, we must force to complete deprovisioning
        if (hasDashboards && !this.providedDeprovisionOption('force', answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'force',
                default: false,
                message: 'You have dashboards added by another application, force deprovisioning?',
            })
            if (response)
                this.setDeprovisionOption('force', response.force)
        } else
            this.setDeprovisionOption('force',this.getDeprovisionOption('force', false, answers))

    }
}