import { baseProvisionerType } from '../index'

export const removeInquireMixin = (base: baseProvisionerType) => class extends base {

    async removeInquire() {
        // Currently no deprovision options are supported
    }
}