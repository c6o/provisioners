import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
    removeApplyMixin,
} from "./mixins"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase)
    .with(createInquireMixin, createApplyMixin, createValidateMixin, removeApplyMixin) {
}