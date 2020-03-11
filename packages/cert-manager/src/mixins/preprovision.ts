import { baseProvisionerType } from '..'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedEnvironmentSetting() {
        return this.spec.staging || this.options['staging']
    }

    get providedNotifyEmailSetting() {
        return this.spec.notifyEmail || this.options['notifyEmail']
    }

    async preprovision() {

        if (!this.providedEnvironmentSetting) {

            const choices: any[] = [{
                name: "Specify Environment",
                value: "**Environment**"
    
            }, new this.manager.inquirer.Separator(), 'development', 'staging', 'production']
            
            // TODO: selector
        
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'environment',
                default: 'development',
                message: 'What is your environment?'
            })

            switch(response.environment) {
                case 'production' :
                    this.spec.staging = '' // empty for production
                case 'development' :
                case 'staging' :
                default :
                    this.spec.staging = '-staging' // appends -staging to cert-manager
            }
        }

        if (!this.providedNotifyEmailSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'notifyEmail',
                default: '',
                message: 'What email address would you like to use for notifications?',
            })
            if (response)
                this.spec.notifyEmail = response.notifyEmail
            else
                this.spec.notifyEmail = false
        }
    }
}