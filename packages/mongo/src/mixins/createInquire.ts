import { baseProvisionerType } from '../'

declare module '../' {
    export interface Provisioner {
        hasDatabasesToConfigure: boolean
    }
}
export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    providedSecretKeyRef(args) {
        return this.spec.secretKeyRef || args['secret-key']
    }

    async inquire(args) {
        const answers = {
            storageClass: args['storage-class'] || await this.getDefaultStorageClass(),
            secretKeyRef: args['secret-key-ref'] || this.spec.secretKeyRef
        }

        const responses = await this.manager.inquirer?.prompt(
            this.inquireStorageClass({
                name: 'storageClass'
            }),
            {
                type: 'input',
                name: 'secretKeyRef',
                default: 'mongo-connections',
                message: 'Where should connection strings be stored?',
                when: () => this.hasDatabasesToConfigure && !this.providedSecretKeyRef(args)
            }, answers)

        return responses
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.secretKeyRef = results.secretKeyRef
    }
}