import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    predeprovisionMixin,
    deprovisionMixin,
    preprovisionMixin,
    provisionMixin,
    helpMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(helpMixin, predeprovisionMixin, deprovisionMixin, preprovisionMixin, provisionMixin,) {
}