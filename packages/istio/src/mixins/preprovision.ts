import { baseProvisionerType } from '../'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedHostName() {
        // The host name is provided either in
        // 1) The service spec
        // 2) The options
        if (this.options['host'])
            this.spec.hostName = this.options['host']
        return this.spec.hostName
    }

    get providedDomainName() {
        // The domain name is provided either in
        // 1) The service spec
        // 2) The options
        if (this.options['domain'])
            this.spec.domainName = this.options['domain']
        return this.spec.domainName
    }

    get providedHttpsRedirect() {
        // The tls is provided either in
        // 1) The service spec
        // 2) The options
        if (typeof this.options['https-redirect'] == 'boolean')
            this.spec.httpsRedirect = this.options['https-redirect']
        return this.spec.httpsRedirect
    }

    async preprovision() {

        if (!this.providedDomainName) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'domainName',
                validate: (domainName) => domainName != undefined && domainName.length > 0,
                message: 'What is the cluster domain?'
            })

            this.spec.domainName = response.domainName
        }

        if (!this.providedHostName) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'hostName',
                default: undefined,
                message: 'What is the cluster name?'
            })

            this.spec.hostName = response.hostName
        }

        if (!this.providedHttpsRedirect) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'httpsRedirect',
                default: true,
                message: 'Enable https redirect?',
            })

            this.spec.httpsRedirect = response.httpsRedirect

        } else
            this.spec.httpsRedirect = true

        if (!this.providedDomainName)
            throw new Error('Domain name is required')
    }
}