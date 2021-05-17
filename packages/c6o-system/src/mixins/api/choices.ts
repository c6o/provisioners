import { AppHelper } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            let apps = await AppHelper.byInterface(this.controller.cluster, 'npm-registry')
            const npmOptions = apps.map(app => ({
                    name: `${app.metadata.namespace}/${app.metadata.name}`,
                    ...app.spec.services['npm-registry']
                })
            ) || []

            apps = await AppHelper.from(null, 'prometheus').list(this.controller.cluster, 'Failed to find Prometheus')
            const prometheusOptions = apps.map(app => app.metadata.namespace) || []
            apps = await AppHelper.from(null, 'grafana').list(this.controller.cluster, 'Failed to find Grafana')
            const grafanaOptions = apps.map(app => app.metadata.namespace) || []
            apps =  await AppHelper.from(null, 'logstash').list(this.controller.cluster, 'Failed to find Logstash')
            const loggerOptions = apps.map(app => `${app.metadata.namespace}/${app.metadata.name}`) || []
            return {
                npmOptions,
                loggerOptions,
                prometheusOptions,
                grafanaOptions
            }
        }
    }
}