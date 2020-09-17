import { baseProvisionerType } from "../index"

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        // Validate provisioner spec before proceeding.

        // if (!this.spec.requiredProperty)
        //    throw new Error("JICOFO Component Secret is required")
    }
}
