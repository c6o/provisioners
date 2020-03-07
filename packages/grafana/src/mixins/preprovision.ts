import { baseProvisionerType } from '../index'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedStorageSetting() {
        return this.spec.storage || this.options['storage']
    }

    get providedAdminUsername() {
        return this.spec.adminUsername || this.options['adminUsername']
    }

    get providedAdminPassword() {
        return this.spec.adminUsername || this.options['adminPassword']
    }

    async preprovision() {

        if (!this.providedStorageSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'storage',
                default: '2Gi',
                message: 'How much storage do you need for Grafana?'
            })

            if (response)
                this.spec.storage = response.storage
            else
                this.spec.storage = '2Gi'
        } else {
            this.spec.storage = this.providedStorageSetting
        }

        if (!this.providedAdminUsername) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'adminUsername',
                default: 'admin',
                message: 'What is the admin username?'
            })

            if (response)
                this.spec.adminUsername = response.adminUsername
            else
                this.spec.adminUsername = 'admin'
        } else {
            this.spec.adminUsername = this.providedAdminUsername
        }
        
        if (!this.providedAdminPassword) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'adminPassword',
                default: 'admin',
                message: 'What is the admin password?'
            })

            if (response)
                this.spec.adminPassword = response.adminPassword
            else
                this.spec.adminPassword = 'admin'
        } else {
            this.spec.providedAdminPassword = this.providedAdminPassword
        }
    }
}