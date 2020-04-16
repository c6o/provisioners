import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    provisionMixin,
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(provisionMixin,) {
}