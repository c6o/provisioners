import inquirer from 'inquirer'
import { getDefaultStorageClass, inquireStorageClass } from '@provisioner/common'
import { baseProvisionerType } from '../'
declare module '../' {
    export interface Provisioner {
        hasDatabasesToConfigure: boolean
        providedSecretKeyRef(args): string
    }
}
export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    providedSecretKeyRef(args) {
        return this.spec.secretKeyRef || args['secret-key']
    }

    async createInquire(args) {
        const answers = {
            storageClass: args['storage-class'] || await getDefaultStorageClass(this.cluster),
            secretKeyRef: args['secret-key-ref'] || this.spec.secretKeyRef
        }

        const responses = await inquirer.prompt([
            inquireStorageClass(this.cluster, {
                name: 'storageClass'
            }),
            {
                type: 'input',
                name: 'secretKeyRef',
                default: 'mongo-connections',
                message: 'Where should connection strings be stored?',
                when: () => this.hasDatabasesToConfigure && !this.providedSecretKeyRef(args)
            }], answers)

        this.spec.storageClass = responses.storageClass
        this.spec.secretKeyRef = responses.secretKeyRef
    }
}