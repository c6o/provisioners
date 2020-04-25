import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    providedEnvironmentSetting(answers) {
        return this.spec.environment || answers['environment']
    }

    providedNotifyEmailSetting(answers) {
        return this.spec.notifyEmail || answers['notifyEmail']
    }

    async createInquire(answers) {

        if (!this.providedEnvironmentSetting(answers)) {

            // TODO: selector

            // const choices: any[] = [{
            //     name: 'Specify Environment',
            //     value: '**Environment**'

            // }, new this.manager.inquirer.Separator(), 'development', 'staging', 'production']

            const response = await this.manager.inquirer.prompt({
                type: 'input',
                name: 'environment',
                default: 'development',
                message: 'What is your environment?'
            })

            this.spec.environment = response.environment
        }

        if (!this.providedNotifyEmailSetting(answers)) {
            const response = await this.manager.inquirer.prompt({
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