import inquirer from 'inquirer'
import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi','2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    async createInquire(args) {
        if (!this.isPreview) {
            const answers = {
                suitecrmusername: args['username'] || this.spec.suitecrmusername,
                suitecrmpassword: args['password'] || this.spec.suitecrmpassword,
                databasesize: args['database-size'] || this.spec.databasesize,
            }

            const responses = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'suitecrmusername',
                    message: 'Administrator Username?'
                },
                {
                    type: 'input',
                    name: 'suitecrmpassword',
                    message: 'Administrator Password?'
                },
                {
                    type: 'list',
                    name: 'databasesize',
                    choices: this.storageSizeChoices,
                    default: '1Gi',
                    message: 'How much storage should we allocate for the database?',
                },
            ], answers)

            this.spec.suitecrmusername = responses.suitecrmusername
            this.spec.suitecrmpassword = responses.suitecrmpassword
            this.spec.databasesize = responses.databasesize
        }
    }
}
