import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    //Accepts 100users, 1000users, 5000users, 10000users, or 25000users.
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    usersProvided(answers) { return !!(this.spec.users || answers.users) }
    ingressNameProvided(answers) { return !!(this.spec.ingressName || answers.ingressName) }
    mattermostLicenseSecretProvided(answers) { return !!(this.spec.mattermostLicenseSecret || answers.mattermostLicenseSecret) }
    databaseStorageSizeProvided(answers) { return !!(this.spec.databaseStorageSize || answers.databaseStorageSize) }
    minioStorageSizeProvided(answers) { return !!(this.spec.minioStorageSize || answers.minioStorageSize) }
    elasticHostProvided(answers) { return !!(this.spec.elasticHost || answers.elasticHost) }
    elasticUsernameProvided(answers) { return !!(this.spec.elasticUsername || answers.elasticUsername) }
    elasticPasswordProvided(answers) { return !!(this.spec.elasticPassword || answers.elasticPassword) }

    async createInquire(answers) {

        console.log('----------------------------------')
        console.log(this.manager.document)
        console.log('----------------------------------')

        const edition = this.manager.document.spec.edition
        const isPreview = (edition == 'preview')

        console.log('----------------------------------')
        console.log(edition, isPreview)
        console.log('----------------------------------')

        if (!isPreview) {

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
