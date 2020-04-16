import { baseProvisionerType } from '../'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    providedSecretKeyRef(answers) {
        return this.spec.secretKeyRef || answers['secret-key']
    }

    async createInquire(answers) {
        if (this.hasDatabasesToConfigure && !this.providedSecretKeyRef(answers)) {
            // Spec has databases to be configured but does not specify
            // the secret key reference where to put the connection strings once configured

            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'secretKeyRef',
                default: 'mongo-connections',
                message: 'Where should connection strings be stored?'
            })

            if (response)
                this.spec.secretKeyRef = response.secretKeyRef
            else
                this.spec.secretKeyRef = 'mongo-connections' // TODO: Warn user that a default
        }
    }
}