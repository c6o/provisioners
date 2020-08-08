import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async inquire(args) {
        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
            storage: args['storage'],
            hostname: args['hostname']
        }

        const responses = await this.manager.inquirer?.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            })
        ,{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your NextCloud service?',
            choices: this.storageChoices,
            default: '2Gi'
        },{
            type: 'domain',
            name: 'adminUsername',
            message: 'What is the admin username?',
            choices: this.storageChoices,
            default: 'admin'
        },{
            type: 'domain',
            name: 'adminPassword',
            message: 'What is the admin password?',
            choices: this.storageChoices,
            default: 'admin'
        },{
            type: 'domain',
            name: 'hostname',
            message: 'What is the domain name for your NextCloud?',
            choices: this.storageChoices,
            default: ''
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.storage = results.storage
        this.spec.adminUsername = results.adminPassword
        this.spec.hostname = results.hostname
    }
}