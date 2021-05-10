import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            let apps = await this.resolver.getInstalledServices('npm-registry')
            const npmOptions = apps.map(app => {
                return {
                    name: `${app.metadata.namespace}/${app.metadata.name}`,
                    ...app.spec.services['npm-registry']
                }
            }) || []
            apps = await this.resolver.getInstalledApps('prometheus')
            const prometheusOptions = apps.map(app => app.metadata.namespace) || []
            apps = await this.resolver.getInstalledApps('grafana')
            const grafanaOptions = apps.map(app => app.metadata.namespace) || []
            apps = await this.resolver.getInstalledServices('logstash')
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