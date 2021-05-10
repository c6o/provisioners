import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            let apps = await this.resolver.getInstalledApps('grafana')
            const grafanaOptions = apps.map(app => app.metadata.namespace) || []
            apps = await this.resolver.getInstalledApps('prometheus')
            const prometheusOptions = apps.map(app => app.metadata.namespace) || []
            return {
              grafanaOptions,
              prometheusOptions
            }
        }
    }
}
