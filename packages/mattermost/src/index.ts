import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    createApplyMixin,
    createInquireMixin,
    removeApplyMixin,
    removeInquireMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, removeApplyMixin, removeInquireMixin) {
}