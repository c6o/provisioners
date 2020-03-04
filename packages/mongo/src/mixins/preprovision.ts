import { baseProvisionerType } from '../'

export const preprovisionMixin = (base: baseProvisionerType) => class extends base {

    get hasDatabasesToConfigure() {
        return this.spec.config
    }

    get providedSecretKeyRef() {
        // The secret key can be provided either in (order of priority)
        // 1) The service spec
        // 2) The applicationSpec
        // 3) The options
        // 4) defaults to 'mongo-connections'
        return this.spec.secretKeyRef ||
               this.applicationSpec.provisioner?.secretKeyRef ||
               this.options['secret-key']
    }

    setSecretKeyRef(val :string) {
        this.spec.secretKeyRef = val
    }

    async preprovision() {
        if (this.hasDatabasesToConfigure && !this.providedSecretKeyRef) {
            // Spec has databases to be configured but does not specify
            // the secret key reference where to put the connection strings once configured

            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'secretKeyRef',
                default: 'mongo-connections',
                message: 'Where should connection strings be stored?'
            })

            if (response)
                this.setSecretKeyRef(response.secretKeyRef)
            else
                this.setSecretKeyRef('mongo-connections') // TODO: Warn user that a default
        }
    }
}