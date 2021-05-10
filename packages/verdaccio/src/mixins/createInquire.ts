import inquirer from 'inquirer'
import { getDefaultStorageClass, inquireStorageClass } from '@provisioner/common'
import { baseProvisionerType } from '..'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    async inquire(args) {
        const answers = {
            storageClass: args['storage-class'] || await getDefaultStorageClass(this.cluster)
        }

        const responses = await inquirer.prompt([
            inquireStorageClass(this.cluster, {
                name: 'storageClass'
            })], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
    }
}