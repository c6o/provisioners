import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {
    async createInquire(args) {

        const answers = {
            storage: args.storage || this.spec.storage,
            adminUsername: args.adminUsername || this.spec.adminUsername,
            adminPassword: args.adminPassword || this.spec.adminPassword
        }

        const separator = new (this.manager.inquirer?.Separator)()

        const responses = await this.manager.inquirer?.prompt([{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for Grafana?',
            choices: ['2Gi','4Gi','8Gi', separator, { name: 'Other size', value: undefined }],
            default: '2Gi'
        }, {
            type: 'input',
            name: 'storage',
            default: '2Gi',
            message: 'Specify size:'
        },{
            type: 'input',
            name: 'adminUsername',
            default: 'admin',
            message: 'What is the admin username?'
        },{
            type: 'password',
            name: 'adminPassword',
            default: 'admin',
            message: 'What is the admin password?'
        }], answers)

        this.spec.storage = responses.storage
        this.spec.adminUsername = responses.adminUsername
        this.spec.adminPassword = responses.adminPassword
    }
}