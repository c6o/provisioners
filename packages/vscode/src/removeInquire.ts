import inquirer from 'inquirer'
import { baseProvisionerType } from './index'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    async removeInquire(answers) {

        if (!this.providedDeprovisionOption('keep-ip', answers)) {
            const response = await inquirer.prompt({
                type: 'confirm',
                name: 'keepIp',
                default: false,
                message: 'Keep IP address?',
            })
            if (response)
                this.setDeprovisionOption('keep-ip', this.keepIp = response.keepIp)
        } else
            this.setDeprovisionOption('keep-ip', this.getDeprovisionOption('keep-ip', false, answers))

        if (!this.providedDeprovisionOption('keep-vol', answers)) {
            const response = await inquirer.prompt({
                type: 'confirm',
                name: 'keepVolume',
                default: true,
                message: 'Keep data volume?',
            })
            if (response)
                this.setDeprovisionOption('keep-vol',response.keepVolume)
        } else
            this.setDeprovisionOption('keep-vol', this.getDeprovisionOption('keep-vol', true, answers))
    }
}

