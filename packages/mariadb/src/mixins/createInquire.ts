import inquirer from 'inquirer'
import { getDefaultStorageClass, inquireStorageClass } from '@provisioner/common'
import { baseProvisionerType } from '../'

declare module '../' {
    export interface Provisioner {
        hasDatabasesToConfigure: boolean
        providedSecretKeyRef(args)
    }
}
export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    providedSecretKeyRef(args) {
        return this.spec.secretKeyRef || args['secret-key'] || args.answers['secret-key']
    }

    async inquire(args) {
        args.answers = args.answers || {}
        const answers = {
            storageClass: args['storage-class'] || args.answers['storage-class'] || await getDefaultStorageClass(this.cluster),
            secretKeyRef: args['secret-key-ref'] || args.answers['secret-key-ref'] || this.spec.secretKeyRef
        }

        const responses = await inquirer.prompt([
            inquireStorageClass(this.cluster, {
                name: 'storageClass'
            }),
            {
                type: 'input',
                name: 'secretKeyRef',
                default: 'mariadb-connections',
                message: 'Where should connection strings be stored?',
                when: () => this.hasDatabasesToConfigure && !this.providedSecretKeyRef(args)
            }], answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.secretKeyRef = results.secretKeyRef
    }
}