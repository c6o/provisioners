import { baseProvisionerType } from '../'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    async predeprovision() {
        if (this.hasDatabasesToConfigure && !this.providedSecretKeyRef) {
            // Spec has databases to be configured but does not specify
            // the secret key reference where to put the connection strings once configured
            // TODO: label the secret so we can find it and remove it automatically, or always
            // use the same name?
            const response = await this.manager.inquirer?.prompt({
                type: 'input',
                name: 'secretKeyRef',
                default: 'mongo-connections',
                message: 'Where were connection strings stored?'
            })

            if (response)
                this.setSecretKeyRef(response.secretKeyRef)
            else
                this.setSecretKeyRef('mongo-connections')
        }
    }
}