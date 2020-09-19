import { baseProvisionerType } from "../index"

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {
        const namespace = this.manager.document.metadata.namespace

        // It is then safe to remove the following
        // You may not have to remove the following because owners takes care of most of it
        await this.manager.cluster
            .begin(`De-provisioning the app from ${namespace}`)
            .end()
    }
}