import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    deprovisionMixin,
    helpMixin,
    preprovisionMixin,
    provisionMixin,
    predeprovisionMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(predeprovisionMixin, deprovisionMixin, helpMixin, preprovisionMixin, provisionMixin,) {
}