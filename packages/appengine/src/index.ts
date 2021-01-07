import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"
import { AppEngineAppObject, AppEngineState, AppManifest } from "./appObject"

import {
    createApplyMixin,
    createInquireMixin,

    // helpers
    templateHelperMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase { }

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, templateHelperMixin) {

    _manifestHelper
    get manifestHelper(): AppEngineAppObject {
        if (this._manifestHelper)
            return this._manifestHelper
        return this._manifestHelper = new AppEngineAppObject(this.manager.document)
    }

    state: AppEngineState
}