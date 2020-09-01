import { baseProvisionerType } from '../index'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        const {
            username,
            password,
        } = this.spec

        if (!username || username === '')
            throw new Error('Username is required')

        if (!password || password === '')
            throw new Error('Password is required')

    }
}
