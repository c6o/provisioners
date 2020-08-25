import { baseProvisionerType } from '../index'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        const {
            secret,
            authPassword,
            jvbPassword,
        } = this.spec

        if (!secret || secret === '')
            throw new Error('JICOFO Component Secret is required')

        if (!authPassword || authPassword === '')
            throw new Error('JICOFO Auth Password is required')

        if (!jvbPassword || jvbPassword === '')
            throw new Error('JVB Auth Password is required')

    }
}
