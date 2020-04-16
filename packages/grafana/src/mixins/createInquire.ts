import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    providedStorageSetting(answers) {
        return this.spec.storage || answers['storage']
    }

    providedAdminUsername(answers) {
        return this.spec.adminUsername || answers['adminUsername']
    }

    providedAdminPassword(answers) {
        return this.spec.adminUsername || answers['adminPassword']
    }

    async createInquire(answers) {

        if (!this.providedStorageSetting(answers)) {
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
            this.spec.storage = this.providedStorageSetting(answers)
        }

        if (!this.providedAdminUsername(answers)) {
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
        } else
            this.spec.adminUsername = this.providedAdminUsername(answers)
        
        if (!this.providedAdminPassword(answers)) {
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
        } else
            this.spec.providedAdminPassword = this.providedAdminPassword(answers)
    }
}