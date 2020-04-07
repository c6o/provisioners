import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    deprovisionMixin,
    provisionMixin,
    helpMixin,
    predeprovisionMixin,
    preprovisionMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(helpMixin, deprovisionMixin, preprovisionMixin, provisionMixin,) {
}