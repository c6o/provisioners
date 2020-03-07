import { baseProvisionerType } from '../index'

export const configureMixin = (base: baseProvisionerType) => class extends base {

    async ask(options) {
        if (options['link-grafana'])
            await this.linkGrafana()
    }
}