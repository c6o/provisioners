import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateAddUser(appNamespace) {
        const newUser = this.spec['add-user']
        if (newUser) {
            super.status?.push('Adding user to Mosquitto')
            await this.addUser(newUser.user, newUser.password, appNamespace, true)
            super.document.spec.provisioner['add-user'] = '$unset'
            super.status?.pop()
        }
    }

    async updateRemoveUser(appNamespace) {
        const removeUser = this.spec['remove-user']

        if (removeUser) {
            super.status?.push('Removing user from Mosquitto')
            await this.removeUser(removeUser.user, appNamespace, true)
            super.document.spec.provisioner['remove-user'] = '$unset'
            super.status?.pop()
        }
    }

    async updateUpdateUser(appNamespace) {
        const updateUser = this.spec['update-user']

        if (updateUser) {
            super.status?.push('Updating user in Mosquitto')
            await this.updateUser(updateUser.originalUsername, updateUser.newUsername, updateUser.password, appNamespace)
            super.document.spec.provisioner['update-user'] = '$unset'
            super.status?.pop()
        }
    }

    async updateApply() {

        const appNamespace = super.document.metadata.namespace

        await this.updateAddUser(appNamespace)
        await this.updateRemoveUser(appNamespace)
        await this.updateUpdateUser(appNamespace)
    }
}