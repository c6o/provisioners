import { baseProvisionerType } from './index'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    deprovisionSpec

    providedOption(option) {
        return (this.deprovisionSpec[option] !== undefined) || (this.options[option] !== undefined)
    }

    getOption(option, defaultValue) {
        if (this.deprovisionSpec[option] !== undefined)
            return this.deprovisionSpec[option]

        this.options[option] !== undefined ? this.options[option] : defaultValue
    }

    async predeprovision() {

        this.deprovisionSpec = this.spec.deprovision || {}

        if (!this.providedOption('keep-ip')) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'keepIp',
                default: false,
                message: 'Keep IP address?',
            })
            if (response)
                this.keepIp = response.keepIp
        } else
            this.keepIp = this.getOption('keep-ip', false)

        if (!this.providedOption('keep-vol')) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'keepVolume',
                default: true,
                message: 'Keep data volume?',
            })
            if (response)
                this.keepVolume = response.keepVolume
        } else
            this.keepVolume = this.getOption('keep-vol', true)
    }
}

