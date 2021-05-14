import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateAddUser(appNamespace) {
        const newUser = this.spec['add-user']
        if (newUser) {
            this.controller.status?.push('Adding user to Mosquitto')
            await this.addUser(newUser.user, newUser.password, appNamespace, true)
            this.controller.document.spec.provisioner['add-user'] = '$unset'
            this.controller.status?.pop()
        }
    }

    async updateRemoveUser(appNamespace) {
        const removeUser = this.spec['remove-user']

        if (removeUser) {
            this.controller.status?.push('Removing user from Mosquitto')
            await this.removeUser(removeUser.user, appNamespace, true)
            this.controller.document.spec.provisioner['remove-user'] = '$unset'
            this.controller.status?.pop()
        }
    }

    async updateUpdateUser(appNamespace) {
        const updateUser = this.spec['update-user']

        if (updateUser) {
            this.controller.status?.push('Updating user in Mosquitto')
            await this.updateUser(updateUser.originalUsername, updateUser.newUsername, updateUser.password, appNamespace)
            this.controller.document.spec.provisioner['update-user'] = '$unset'
            this.controller.status?.pop()
        }
    }

    async updateApply() {

        const appNamespace = this.controller.document.metadata.namespace

        await this.updateAddUser(appNamespace)
        await this.updateRemoveUser(appNamespace)
        await this.updateUpdateUser(appNamespace)
    }
}