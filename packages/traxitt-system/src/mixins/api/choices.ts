import { baseProvisionerType } from '../../'

export const choicesApiMixin = (base: baseProvisionerType) => class extends base {

    'choices' = {
        find: async () => {
            const apps = await this.manager.getInstalledServices('logstash')
            const loggerOptions = apps.map(app => `${app.metadata.namespace}/${app.metadata.name}`) || []
            return {
              loggerOptions
            }
        }
    }
}