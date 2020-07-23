import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['1Gi','5Gi','10Gi','50Gi','100Gi','200Gi','400Gi','1000Gi']
    userCountChoices = ['5000','10000','25000']

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

        if (!this.nameProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'name',
                default: this.spec.name || "mattermost",
                message: 'Name?',
            })

            this.spec.name = response?.name || false
        }

        if (!this.usersProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'users',
                choices: this.userCountChoices,
                default: this.spec.users || '5000',
                message: 'Expected users count?',
            })

            this.spec.users = response?.users || false
        }

        if (!this.ingressNameProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'ingressName',
                default: this.spec.ingressName || "mattermost.mydomain.org",
                message: 'Ingress name (DNS host name)?',
            })

            this.spec.ingressName = response?.ingressName || false
        }

        if (!this.mattermostLicenseSecretProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'mattermostLicenseSecret',
                default: this.spec.mattermostLicenseSecret,
                message: 'Mattermost license secret',
            })

            this.spec.mattermostLicenseSecret = response?.mattermostLicenseSecret || false
        }

        if (!this.databaseStorageSizeProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'databaseStorageSize',
                choices: this.storageChoices,
                default: this.spec.databaseStorageSize || '5Gi',
                message: 'Amount of storage to provision for the database?',
            })

            this.spec.databaseStorageSize = response?.databaseStorageSize || false
        }

        if (!this.minioStorageSizeProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'minioStorageSize',
                choices: this.storageChoices,
                default: this.spec.minioStorageSize || '5Gi',
                message: 'Amount of storage to provision for the minio?',
            })

            this.spec.minioStorageSize = response?.minioStorageSize || false
        }

        if (!this.elasticHostProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'elasticHost',
                default: this.spec.elasticHost || "elastic.mydomain.org",
                message: 'ElasticSearch Host?',
            })

            this.spec.elasticHost = response?.elasticHost || false
        }

        if (!this.elasticUsernameProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'elasticUsername',
                default: this.spec.elasticUsername || "mattermost",
                message: 'ElasticSearch Username?',
            })

            this.spec.elasticUsername = response?.elasticUsername || false
        }

        if (!this.elasticPasswordProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'elasticPassword',
                default: this.spec.elasticPassword || "password",
                message: 'ElasticSearch Password?',
            })

            this.spec.elasticPassword = response?.elasticPassword || false
        }

    }
}
