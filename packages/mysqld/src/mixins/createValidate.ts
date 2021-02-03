import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        // TODO: check fields are all set
        this.spec.secretKeyRef = this.spec.secretKeyRef || 'mongo-connections'
    }
}