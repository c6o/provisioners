import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    userMgmtMixin,
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
    removeApplyMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, createValidateMixin, removeApplyMixin, userMgmtMixin, updateApplyMixin) {

    get isLatest() { return this.edition === 'latest' }

}