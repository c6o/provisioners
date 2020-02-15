import { baseProvisionerType } from './index'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {
        // TODO: Implement deprovision
    }
}