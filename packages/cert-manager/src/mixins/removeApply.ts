import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {
        // TODO: Implement deprovision
    }
}