import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    providedStorageSetting = (answers) => {
        return this.spec.storage || answers['storage']
    }
    
    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async inquire(args) {
        const answers = {
            storage: args['storage']
        }

        const responses = await this.manager.inquirer?.prompt([{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your log storage?',
            choices: this.storageChoices,
            default: '1Gi'
        }], answers)

        return responses
    }

    async createInquire(args) {
        const answers = await this.inquire(args)

        this.spec.storage = answers.storage ? answers.storage : '1Gi'
    }
}