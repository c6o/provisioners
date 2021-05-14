import inquirer from 'inquirer'
import { StorageClassHelper } from '@provisioner/common'
import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {
    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async inquire(args) {
        const answers = {
            storageClass: args['storage-class'] || await StorageClassHelper.getDefault(this.controller.cluster),
            storage: args['storage'] || this.spec.storage,
            adminUsername: args['username'] || this.spec.username,
            adminPassword: args['password'] || this.spec.password,
        }

        const responses = await inquirer.prompt([
            StorageClassHelper.inquire(this.controller.cluster, {
                name: 'storageClass'
            })
        ,{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your log storage?',
            choices: this.storageChoices,
            default: this.spec.storage || '2Gi'
        }, {
            type: 'input',
            name: 'adminUsername',
            message: 'What is the admin username?',
            default: this.spec.adminUsername || 'admin'
        }, {
            type: 'password',
            name: 'adminPassword',
            message: 'What is the admin password?',
            default: this.spec.adminPassword || 'admin'
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.storage = results.storage
        this.spec.adminUsername = results.adminUsername
        this.spec.adminPassword = results.adminPassword
    }
}