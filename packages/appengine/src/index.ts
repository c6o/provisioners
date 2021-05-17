import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { AppEngineAppHelper } from '@provisioner/appengine-contracts'

import {
    createApplyMixin,
    createInquireMixin,

    // helpers
    templateHelperMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner

export interface Provisioner extends ProvisionerBase {

}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, templateHelperMixin) {

    // Override the documentHelper in ProvisionerBase
    get documentHelper(): AppEngineAppHelper {
        if (this._documentHelper)
            return this._documentHelper
        if (!this.controller.resource)
            return
        return this._documentHelper = new AppEngineAppHelper(this.controller.resource)
    }
}