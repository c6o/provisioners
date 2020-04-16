import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    providedStorageSetting(answers) {
        return this.spec.storage || answers['storage']
    }

    providedProjectSetting(answers) {
        return this.spec.projects !== undefined ? this.spec.projects : answers['projects']
    }

    async createInquire(answers) {

        // TODO: use inquire properly
        if (!this.providedStorageSetting(answers)) {
            const response = await this.manager.inquirer.prompt({
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

        if (!this.providedProjectSetting(answers)) {
            const response = await this.manager.inquirer.prompt({
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