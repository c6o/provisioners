import inquirer from 'inquirer'
import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    async createInquire(args) {

        if (this.edition === 'latest') {

            const answers = {
                databaseSize: args['datbase-storage-size'] || this.spec.databaseSize,
                shopAddonsDatabaseSize: args['addons-storage-size'] || this.spec.shopAddonsDatabaseSize,
            }

            const responses = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'databaseSize',
                    choices: this.storageSizeChoices,
                    default: '1Gi',
                    message: 'How much storage should we allocate for the database?',
                },
                {
                    type: 'list',
                    name: 'shopAddonsDatabaseSize',
                    choices: this.storageSizeChoices,
                    default: '1Gi',
                    message: 'How much storage should we allocate for the users addons?',
                }
            ], answers)

            this.spec.databaseSize = responses.databaseSize
            this.spec.shopAddonsDatabaseSize = responses.shopAddonsDatabaseSize
        }
    }
}
