import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        const {
            hostname,
            adminUsername,
            adminPassword } = this.spec

        if (!hostname)
            throw new Error('A hostname is required.')

        if(!adminUsername)
            throw new Error('Admin username is required.')

        if(!adminPassword)
            throw new Error('Admin password cannot be blank.')
    }
}