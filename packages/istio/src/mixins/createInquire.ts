import { baseProvisionerType } from '../'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {
        const answers = {
            httpsRedirect: args['https-redirect'] || this.spec.httpsRedirect
        }

        const response = await this.manager.inquirer.prompt({
            type: 'confirm',
            name: 'httpsRedirect',
            default: true,
            message: 'Enable https redirect?',
        }, answers)

        this.spec.httpsRedirect = response.httpsRedirect
    }
}