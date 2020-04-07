import { baseProvisionerType } from '..'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedStorageSetting() {
        return this.spec.storage || this.options['storage']
    }

    get providedProjectSetting() {
        return this.spec.projects !== undefined ? this.spec.projects : this.options['projects']
    }

    async preprovision() {

        if (!this.providedStorageSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'storage',
                default: '2Gi',
                message: 'What size data volume would you like for your Node-RED flows?'
            })

            if (response)
                this.spec.storage = response.storage
            else
                this.spec.storage = '2Gi'
        } else this.spec.storage = '2Gi'

        if (!this.providedProjectSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'projects',
                default: false,
                message: 'Enable projects feature?',
            })
            if (response)
                this.spec.projects = response.projects
            else
                this.spec.projects = false
        } else this.spec.storage = false
    }
}