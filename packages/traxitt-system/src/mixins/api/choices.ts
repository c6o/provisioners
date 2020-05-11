import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            let apps = await this.manager.getInstalledServices('npm-registry')
            const npmOptions = apps.map(app => {
                return {
                    name: `${app.metadata.namespace}/${app.metadata.name}`,
                    ...app.spec.services['npm-registry']
                }
            }) || []
            apps = await this.manager.getInstalledServices('logstash')
            const loggerOptions = apps.map(app => `${app.metadata.namespace}/${app.metadata.name}`) || []
            return {
                npmOptions,
                loggerOptions
            }
        }
    }
}