import { baseProvisionerType } from '..'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get providedEnvironmentSetting() {
        return this.spec.environment || this.options['environment']
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

            this.spec.environment = response.environment
        }

        if (!this.providedNotifyEmailSetting) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
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