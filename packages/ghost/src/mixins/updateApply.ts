import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {


    async updateApply() {

        const appNamespace = this.manager.document.metadata.namespace

    }
}