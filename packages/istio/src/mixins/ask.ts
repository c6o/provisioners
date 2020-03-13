import { baseProvisionerType } from '../index'

export const askMixin = (base: baseProvisionerType) => class extends base {

    async ask(options) {
        if (options['link-grafana'])
            await this.linkGrafana()

        const httpsRedirect = options['https-redirect']
        if (httpsRedirect === true || httpsRedirect === false)
            await this.setHttpsRedirect(httpsRedirect)
    }
}