import { baseProvisionerType } from '../'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedHttpsRedirect() {
        // The tls is provided either in
        // 1) The service spec
        // 2) The options
        if (typeof this.options['https-redirect'] == 'boolean')
            this.spec.httpsRedirect = this.options['https-redirect']
        return this.spec.httpsRedirect
    }

    async preprovision() {

        if (this.providedHttpsRedirect === undefined) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'httpsRedirect',
                default: true,
                message: 'Enable https redirect?',
            })

            if (response)
                this.spec.httpsRedirect = response.httpsRedirect
            else
                this.spec.httpsRedirect = true
        }
    }
}