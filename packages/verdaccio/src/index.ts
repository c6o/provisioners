import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    createApplyMixin,
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin) {
}