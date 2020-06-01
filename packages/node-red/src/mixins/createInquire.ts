import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async createInquire(args) {
        
        const answers = {
            storage: args.storage || this.spec.storage,
            projects: args.projects || this.spec.projects
        }

        const responses = await this.manager.inquirer?.prompt([{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your Node-RED flows?',
            choices: ['2Gi','4Gi','8Gi'],
            default: '2Gi'
        }, {
            type: 'confirm',
            name: 'projects',
            default: false,
            message: 'Enable projects feature?',
        }], answers)

        this.spec.storage = responses.storage
        this.spec.projects = responses.projects
    }
}