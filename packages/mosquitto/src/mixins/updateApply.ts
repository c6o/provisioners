import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateAddUser(appNamespace) {
        const newUser = this.spec['add-user']
        if (newUser) {
            this.status?.push('Adding user to Mosquitto')
            await this.addUser(newUser.user, newUser.password, appNamespace, true)
            this.document.spec.provisioner['add-user'] = '$unset'
            this.status?.pop()
        }
    }

    async updateRemoveUser(appNamespace) {
        const removeUser = this.spec['remove-user']

        if (removeUser) {
            this.status?.push('Removing user from Mosquitto')
            await this.removeUser(removeUser.user, appNamespace, true)
            this.document.spec.provisioner['remove-user'] = '$unset'
            this.status?.pop()
        }
    }

    async updateUpdateUser(appNamespace) {
        const updateUser = this.spec['update-user']

        if (updateUser) {
            this.status?.push('Updating user in Mosquitto')
            await this.updateUser(updateUser.originalUsername, updateUser.newUsername, updateUser.password, appNamespace)
            this.document.spec.provisioner['update-user'] = '$unset'
            this.status?.pop()
        }
    }

    async updateApply() {

        const appNamespace = this.document.metadata.namespace

        await this.updateAddUser(appNamespace)
        await this.updateRemoveUser(appNamespace)
        await this.updateUpdateUser(appNamespace)
    }
}