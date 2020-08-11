import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    //these choices are based on the mattermost enterprise operator/deployment
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    async createInquire(answers) {

        debugger
        const edition = this.manager.document.metadata.labels["system.codezero.io/edition"];
        const isLatest = (edition !== 'preview')

        if (isLatest) {

            //load spec with our default values
            //keep in mind that the default values for lists do NOT show in the UI as you would expect, at least the CLI UI.
            this.spec.users = answers.users || this.spec.users || 5000
            this.spec.mattermostLicenseSecret = answers.mattermostLicenseSecret || this.spec.mattermostLicenseSecret || ''
            this.spec.databaseStorageSize = answers.databaseStorageSize || this.spec.databaseStorageSize || '5Gi'
            this.spec.minioStorageSize = answers.minioStorageSize || this.spec.minioStorageSize || '5Gi'

            //inquire for our values.
            //if we have a value already in answers, skip asking --> these were provided by the customer directly
            //https://www.npmjs.com/package/inquirer
            if (!answers.users) {
                this.spec.users = (await this.manager.inquirer?.prompt(
                    {
                        type: 'list',
                        name: 'users',
                        choices: this.userCountChoices,
                        default: 100, //if no answer
                        message: 'Expected users count (100)?'
                    })).users
            }

            if (!answers.mattermostLicenseSecret || answers.mattermostLicenseSecret === '') {
                this.spec.mattermostLicenseSecret = (await this.manager.inquirer?.prompt(
                    {
                        type: 'input',
                        name: 'mattermostLicenseSecret',
                        default: answers.mattermostLicenseSecret,
                        optional: true,
                        message: 'Mattermost license secret (optional):',
                    }
                )).mattermostLicenseSecret
            }

            if (!answers.databaseStorageSize || answers.databaseStorageSize === '') {
                this.spec.databaseStorageSize = (await this.manager.inquirer?.prompt(
                    {
                        type: 'list',
                        name: 'databaseStorageSize',
                        choices: this.storageSizeChoices,
                        default: answers.databaseStorageSize,
                        message: 'Amount of storage to provision for the database?',
                    }
                )).databaseStorageSize
            }

            if (!answers.minioStorageSize || answers.minioStorageSize === '') {
                this.spec.minioStorageSize = (await this.manager.inquirer?.prompt(
                    {
                        type: 'list',
                        name: 'minioStorageSize',
                        choices: this.storageSizeChoices,
                        default: answers.minioStorageSize,
                        message: 'Amount of storage to provision for minio?',
                    }
                )).minioStorageSize
            }
        }
    }
}
