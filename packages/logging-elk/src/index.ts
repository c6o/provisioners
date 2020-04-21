import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    createInquireMixin,
    createApplyMixin,
    removeInquireMixin,
    removeApplyMixin,
    helpMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(createInquireMixin, createApplyMixin, removeInquireMixin, removeApplyMixin, helpMixin) {
}