import { baseProvisionerType } from './index'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    async predeprovision() {

        if (!this.providedDeprovisionOption('keep-ip')) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'keepIp',
                default: false,
                message: 'Keep IP address?',
            })
            if (response)
                this.keepIp = response.keepIp
        } else
            this.keepIp = this.getDeprovisionOption('keep-ip', false)

        if (!this.providedDeprovisionOption('keep-vol')) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'keepVolume',
                default: true,
                message: 'Keep data volume?',
            })
            if (response)
                this.keepVolume = response.keepVolume
        } else
            this.keepVolume = this.getDeprovisionOption('keep-vol', true)
    }
}

