import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    configureMixin,
    deprovisionMixin,
    preConfigureMixin,
    provisionMixin,
    grafanaMixin
} from "./mixins"

// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(configureMixin, deprovisionMixin, preConfigureMixin, provisionMixin,grafanaMixin) {
}