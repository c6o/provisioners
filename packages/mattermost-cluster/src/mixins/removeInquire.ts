
import { baseProvisionerType } from '..'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    databaseDeprovisionProvided(answers) { return !!(this.spec.databaseDeprovision || answers.databaseDeprovision) }
    minioDeprovisionProvided(answers) { return !!(this.spec.minioDeprovision || answers.minioDeprovision) }

    async removeInquire(answers) {

        if (!this.databaseDeprovisionProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'databaseDeprovision',
                default: false,
                message: 'Deprovision the database?',
            })

            this.spec.databaseDeprovision = response?.databaseDeprovision || false
        }

        if (!this.minioDeprovisionProvided(answers)) {
            const response = await this.manager.inquirer?.prompt({
                type: 'confirm',
                name: 'minioDeprovision',
                default: false,
                message: 'Deprovision minio?',
            })

            this.spec.minioDeprovision = response?.minioDeprovision || false
        }
    }

}