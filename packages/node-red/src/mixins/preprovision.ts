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

            // TODO: selector
            // const choices: any[] = [{
            //     name: "Specify Storage",
            //     value: "**Storage**"

            // }, new this.manager.inquirer.Separator(), '1Gi', '2Gi', '4Gi', '8Gi']

            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'storage',
                default: '2Gi',
                message: 'How much storage do you need for Node-RED?'
            })

            if (response)
                this.spec.storage = response.storage
            else
                this.spec.storage = '2Gi'

        }

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
        }
    }
}