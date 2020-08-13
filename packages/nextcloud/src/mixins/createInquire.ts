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
            type: 'input',
            name: 'hostname',
            message: 'What will be the domain name for your NextCloud?',
            default: 'example.com'
        },{
            type: 'input',
            name: 'adminUsername',
            message: 'Set an initial admin username:',
            default: 'admin'
        },{
            type: 'password',
            name: 'adminPassword',
            message: 'Set an initial admin password:',
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.storage = results.storage
        this.spec.hostname = results.hostname
        this.spec.adminUsername = results.adminUsername
        this.spec.adminPassword = results.adminPassword
    }
}