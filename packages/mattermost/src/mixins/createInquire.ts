import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    userCountChoices = [5000, 10000, 25000]
    editionChoices = ['preview', 'latest']

    editionProvided(answers) { return !!(this.spec.edition || answers.edition) }
    nameProvided(answers) { return !!(this.spec.name || answers.name) }
    usersProvided(answers) { return !!(this.spec.users || answers.users) }
    ingressNameProvided(answers) { return !!(this.spec.ingressName || answers.ingressName) }
    mattermostLicenseSecretProvided(answers) { return !!(this.spec.mattermostLicenseSecret || answers.mattermostLicenseSecret) }
    databaseStorageSizeProvided(answers) { return !!(this.spec.databaseStorageSize || answers.databaseStorageSize) }
    minioStorageSizeProvided(answers) { return !!(this.spec.minioStorageSize || answers.minioStorageSize) }
    elasticHostProvided(answers) { return !!(this.spec.elasticHost || answers.elasticHost) }
    elasticUsernameProvided(answers) { return !!(this.spec.elasticUsername || answers.elasticUsername) }
    elasticPasswordProvided(answers) { return !!(this.spec.elasticPassword || answers.elasticPassword) }

    async createInquire(answers) {

        if (!this.editionProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'list',
                name: 'edition',
                choices: this.editionChoices,
                default: this.spec.name || this.editionChoices[0],
                message: 'Which edition would you like to install?',
            })

            this.spec.edition = response?.edition || 'preview'
        }

        if (!this.nameProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'name',
                default: this.spec.name || 'mattermost',
                message: 'Name?',
            })

            this.spec.name = response?.name || 'mattermost'
        }

        if (this.spec.edition !== 'preview') {

            if (!this.usersProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'list',
                    name: 'users',
                    choices: this.userCountChoices,
                    default: this.spec.users || 5000,
                    message: 'Expected users count?',
                })

                this.spec.users = response?.users || 5000
            }

            if (!this.ingressNameProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'input',
                    name: 'ingressName',
                    default: this.spec.ingressName || 'mattermost.mydomain.org',
                    message: 'Ingress name (DNS host name)?',
                })

                this.spec.ingressName = response?.ingressName
            }

            if (!this.mattermostLicenseSecretProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'input',
                    name: 'mattermostLicenseSecret',
                    default: this.spec.mattermostLicenseSecret,
                    message: 'Mattermost license secret',
                })

                this.spec.mattermostLicenseSecret = response?.mattermostLicenseSecret || ''
            }

            if (!this.databaseStorageSizeProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'list',
                    name: 'databaseStorageSize',
                    choices: this.storageSizeChoices,
                    default: this.spec.databaseStorageSize || '1Gi',
                    message: 'Amount of storage to provision for the database?',
                })

                this.spec.databaseStorageSize = response?.databaseStorageSize || '1Gi'
            }

            if (!this.minioStorageSizeProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'list',
                    name: 'minioStorageSize',
                    choices: this.storageSizeChoices,
                    default: this.spec.minioStorageSize || '1Gi',
                    message: 'Amount of storage to provision for the minio?',
                })

                this.spec.minioStorageSize = response?.minioStorageSize || '1Gi'
            }

            if (!this.elasticHostProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'input',
                    name: 'elasticHost',
                    default: this.spec.elasticHost,
                    message: 'ElasticSearch Host?',
                })

                this.spec.elasticHost = response?.elasticHost || ''
            }

            if (!this.elasticUsernameProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'input',
                    name: 'elasticUsername',
                    default: this.spec.elasticUsername,
                    message: 'ElasticSearch Username?',
                })

                this.spec.elasticUsername = response?.elasticUsername || ''
            }

            if (!this.elasticPasswordProvided(answers)) {
                const response = await this.manager.inquirer?.prompt({
                    type: 'input',
                    name: 'elasticPassword',
                    default: this.spec.elasticPassword,
                    message: 'ElasticSearch Password?',
                })

                this.spec.elasticPassword = response?.elasticPassword || ''
            }
        }
    }
}
