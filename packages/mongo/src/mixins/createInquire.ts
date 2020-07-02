import { baseProvisionerType } from '../'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    providedSecretKeyRef(args) {
        return this.spec.secretKeyRef || args['secret-key']
    }

    async inquire(args) {
        if (this.hasDatabasesToConfigure && !this.providedSecretKeyRef(args)) {
            // Spec has databases to be configured but does not specify
            // the secret key reference where to put the connection strings once configured

            const answers = {
                storageClass: args['storageClass'] || await this.getDefaultStorageClass(),
                secretKeyRef: args['secretKeyRef']            
            }

            const responses = await this.manager.inquirer?.prompt(
                this.inquireStorageClass({
                    name: 'storageClass'
                }),
                {
                    type: 'input',
                    name: 'secretKeyRef',
                    default: 'mongo-connections',
                    message: 'Where should connection strings be stored?'
                }, answers)

            return responses
        }
    }

    async createInquire(args) {
        const results = await this.inquire(args)

        this.spec.storageClass = results.storageClass
        this.spec.secretKeyRef = results.secretKeyRef
    }
}