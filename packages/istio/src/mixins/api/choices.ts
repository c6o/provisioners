import { AppHelper } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            let apps = await AppHelper.from(null, 'grafana').list(this.cluster, 'Failed to find Grafana')
            const grafanaOptions = apps.map(app => app.metadata.namespace) || []
            apps = await AppHelper.from(null, 'prometheus').list(this.cluster, 'Failed to find Prometheus')
            const prometheusOptions = apps.map(app => app.metadata.namespace) || []
            return {
              grafanaOptions,
              prometheusOptions
            }
        }
    }
}
