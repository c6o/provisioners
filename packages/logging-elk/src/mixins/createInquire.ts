import inquirer from 'inquirer'
import { StorageClassHelper } from '@provisioner/common'
import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageChoices = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    async createInquire(args) {
        const answers = {
            storageClass: args['storage-class'] || await StorageClassHelper.getDefault(this.cluster),
            storage: args['storage-size']|| this.spec.storage,
            k8sLogIndexPrefix: args['log-index-prefix']|| this.spec.k8sLogIndexPrefix
        }

        const responses = await inquirer.prompt([
            StorageClassHelper.inquire(this.cluster, {
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


        this.spec.storageClass = responses.storageClass
        this.spec.storage = responses.storage
        this.spec.k8sLogIndexPrefix = responses.k8sLogIndexPrefix
    }
}