import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    createApplyMixin,
    removeApplyMixin,
    removeInquireMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, removeApplyMixin, removeInquireMixin, updateApplyMixin) {

    get isLatest() { return this.edition === 'latest' }

}