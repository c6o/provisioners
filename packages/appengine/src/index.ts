import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { AppEngineAppObject } from '@provisioner/appengine-contracts'

import {
    createApplyMixin,
    createInquireMixin,

    // helpers
    templateHelperMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase { }

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, templateHelperMixin) {

    // Override the documentHelper in ProvisionerBase
    get documentHelper(): AppEngineAppObject {
        if (this._documentHelper || !this.manager?.document)
            return this._documentHelper
        return this._documentHelper = new AppEngineAppObject(this.manager.document)
    }
}