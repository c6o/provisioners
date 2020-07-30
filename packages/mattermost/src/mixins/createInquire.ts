import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    //these choices are based on the mattermost enterprise operator/deployment
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    async createInquire(answers) {

        //copy these over to spec, so they are also available for createApply
        this.spec.edition = this.manager.document.spec.edition
        this.spec.isPreview = (this.spec.edition == 'preview')

        if (!this.spec.isPreview) {

            //load spec with our default values
            //keep in mind that the default values for lists do NOT show in the UI as you would expect, at least the CLI UI.
            this.spec.users = answers.users || this.spec.users || 5000
            this.spec.ingressName = answers.ingressName || this.spec.ingressName || ''
            this.spec.mattermostLicenseSecret = answers.mattermostLicenseSecret || this.spec.mattermostLicenseSecret || ''
            this.spec.databaseStorageSize = answers.databaseStorageSize || this.spec.databaseStorageSize || '5Gi'
            this.spec.minioStorageSize = answers.minioStorageSize || this.spec.minioStorageSize || '5Gi'
            this.spec.elasticHost = answers.elasticHost || this.spec.elasticHost || ''
            this.spec.elasticUsername = answers.elasticUsername || this.spec.elasticUsername || ''
            this.spec.elasticPassword = answers.elasticPassword || this.spec.elasticPassword || ''

            //inquire for our values.
            //if we have a value already in answers, skip asking --> these were provided by the customer directly
            //https://www.npmjs.com/package/inquirer
            if (!answers.users) {
                this.spec.users = (await this.manager.inquirer?.prompt(
                    {
                        type: 'list',
                        name: 'users',
                        choices: this.userCountChoices,
                        default: 5000, //if no answer
                        message: 'Expected users count (5000)?'
                    })).users
            }

            if (!answers.ingressName || answers.ingressName === '') {
                this.spec.ingressName = (await this.manager.inquirer?.prompt(
                    {
                        type: 'input',
                        name: 'ingressName',
                        default: answers.ingressName,
                        optional: false,
                        validate: function(value) { return value != ''},
                        message: 'Ingress name (required)?',
                    })).ingressName
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
                        message: 'Amount of storage to provision for the minio?',
                    }
                )).minioStorageSize
            }

            if (!answers.elasticHost || answers.elasticHost === '') {
                this.spec.elasticHost = (await this.manager.inquirer?.prompt(
                    {
                        type: 'input',
                        name: 'elasticHost',
                        default: answers.elasticHost,
                        optional: true,
                        message: 'ElasticSearch Host (optional)?',
                    }
                )).elasticHost
            }

            if (!answers.elasticUsername || answers.elasticUsername === '') {
                this.spec.elasticUsername = (await this.manager.inquirer?.prompt(
                    {
                        type: 'input',
                        name: 'elasticUsername',
                        default: answers.elasticUsername,
                        optional: true,
                        message: 'ElasticSearch Username (optional)?',
                    }
                )).elasticUsername
            }

            if (!answers.elasticPassword || answers.elasticPassword === '') {
                this.spec.elasticPassword = (await this.manager.inquirer?.prompt(
                    {
                        type: 'input',
                        name: 'elasticPassword',
                        default: answers.elasticPassword,
                        optional: true,
                        message: 'ElasticSearch Password (optional)?',
                    }
                )).elasticPassword
            }
        }
    }
}
