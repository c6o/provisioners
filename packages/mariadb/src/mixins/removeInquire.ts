import inquirer from 'inquirer'
import { baseProvisionerType } from '../'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    async removeInquire(answers) {
        if (this.hasDatabasesToConfigure && !this.providedSecretKeyRef(answers)) {
            // Spec has databases to be configured but does not specify
            // the secret key reference where to put the connection strings once configured
            // TODO: label the secret so we can find it and remove it automatically, or always
            // use the same name?
            const response = await inquirer.prompt({
                type: 'input',
                name: 'secretKeyRef',
                default: 'mariadb-connections',
                message: 'Where were connection strings stored?'
            })

            if (response)
                this.spec.secretKeyRef = response.secretKeyRef
            else
                this.spec.secretKeyRef = 'mariadb-connections' // TODO: Warn user that a default
        }
    }
}