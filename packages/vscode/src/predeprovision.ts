import { baseProvisionerType } from './index'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedKeepIp() {
        return this.options['keep-ip'] !== undefined
    }

    get providedKeepVolume() {
        return this.options['keep-vol'] !== undefined
    }

    async predeprovision() {
        
        if (this.manager.inquirer && !this.providedKeepIp) {
            const response = await this.manager.inquirer.prompt({
                type: 'confirm',
                name: 'keepIp',
                default: false,
                message: 'Keep IP address?',
            })
            if (response)
                this.keepIp = response.keepIp
        } else
            this.keepIp = this.options['keep-ip'] || false

        if (this.manager.inquirer && !this.providedKeepVolume) {
            const response = await this.manager.inquirer.prompt({
                type: 'confirm',
                name: 'keepVolume',
                default: true,
                message: 'Keep data volume?',
            })
            if (response)
                this.keepVolume = response.keepVolume
        } else
            this.keepVolume = this.options['keep-vol'] || true
    }
}

