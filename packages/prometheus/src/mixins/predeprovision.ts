
import { baseProvisionerType } from '..'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {
    async predeprovision() {

        if (!this.simpleServiceProvided) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'simpleService',
                default: false,
                message: 'Deprovision simple prometheus service?',
            })

            this.spec.simpleService = response?.simpleService || false
        }
    }
}