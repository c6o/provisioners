import { baseProvisionerType } from '../index'
import { metadata } from 'core-js/fn/reflect'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {


    async removeApply() {
        const namespace = this.document.metadata.namespace

        // It is then safe to remove the following
        // You may not have to remove the following because owners takes care of most of it
        await this.cluster
            .begin('De-provisioning the app')
            .end()
    }
}