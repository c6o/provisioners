
import { baseProvisionerType } from '..'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {
    async removeInquire(answers) {

        // method defined in createInquire since first used there
        if (!this.simpleServiceProvided(answers)) {
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