import inquirer from 'inquirer'
import { baseProvisionerType } from '../index'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    storageSizeChoices = ['2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    async createInquire(args) {
        if (!this.isPreview) {

            const answers = {
                users: args.users || this.spec.users,
                mattermostLicenseSecret: args['license-secret'] || this.spec.mattermostLicenseSecret,
                databaseStorageSize: args['db-storage-size'] || this.spec.databaseStorageSize,
                minioStorageSize: args['minio-storage-size'] || this.spec.minioStorageSize
            }

            const responses = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'users',
                    choices: this.userCountChoices,
                    default: 0,
                    message: 'How many users do you expect?'
                },
                {
                    type: 'confirm',
                    name: 'haveLicense',
                    default: false,
                    message: 'Do you have a Mattermost license secret?',
                },
                {
                    type: 'input',
                    name: 'mattermostLicenseSecret',
                    message: 'What is your Mattermost license secret?',
                    when: (answers) => answers.haveLicense
                },
                {
                    type: 'list',
                    name: 'databaseStorageSize',
                    choices: this.storageSizeChoices,
                    message: 'How much storage should we allocate for the database?',
                },
                {
                    type: 'list',
                    name: 'minioStorageSize',
                    choices: this.storageSizeChoices,
                    default: 0,
                    message: 'How much storage should we allocate media files?',
                }
            ], answers)

            this.spec.users = responses.users
            this.spec.mattermostLicenseSecret = responses.mattermostLicenseSecret
            this.spec.databaseStorageSize = responses.databaseStorageSize
            this.spec.minioStorageSize = responses.minioStorageSize
        }
    }
}
