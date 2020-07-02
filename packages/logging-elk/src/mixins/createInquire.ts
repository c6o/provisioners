import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async inquire(args) {
        const answers = {
            storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
            storage: args['storage'],
            k8sLogIndexPrefix: args['k8sLogIndexPrefix']
        }

        const responses = await this.manager.inquirer?.prompt([
            this.inquireStorageClass({
                name: 'storageClass'
            })
        ,{
            type: 'list',
            name: 'storage',
            message: 'What size data volume would you like for your log storage?',
            choices: this.storageChoices,
            default: '1Gi'
        }, {
            type: 'input',
            name: 'k8sLogIndexPrefix',
            message: 'What would you like to use for the Kubernetes log index prefix?',
            default: 'cloud'
        }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.storage = results.storage
        this.spec.k8sLogIndexPrefix = results.k8sLogIndexPrefix
    }
}