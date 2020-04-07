import { baseProvisionerType } from '../index'

export const predeprovisionMixin = (base: baseProvisionerType) => class extends base {

    async predeprovision() {
        // Currently no deprovision options are supported
    }
}