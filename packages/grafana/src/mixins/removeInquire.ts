import inquirer from 'inquirer'
import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { baseProvisionerType } from '../index'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    dashboardConfigMap(namespace: string): ConfigMap {
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
        const namespace = this.controller.resource.metadata.namespace

        const result = await this.controller.cluster.list(this.dashboardConfigMap(namespace))
        let hasDashboards = false
        if (!result.error)
            hasDashboards = result.object?.items?.length ? true : false

        // if we have dashboards, we must force to complete deprovisioning
        if (hasDashboards && !super.providedDeprovisionOption('force', answers)) {
            const response = await inquirer.prompt({
                type: 'confirm',
                name: 'force',
                default: false,
                message: 'You have dashboards added by another application, force deprovisioning?',
            })
            if (response)
            super.setDeprovisionOption('force', response.force)
        } else
            super.setDeprovisionOption('force',super.getDeprovisionOption('force', false, answers))

    }
}