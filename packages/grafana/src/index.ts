import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    apiMixin,
    dashboardApiMixin,
    deprovisionMixin,
    helpMixin,
    preprovisionMixin,
    provisionMixin
} from "./mixins"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(apiMixin, helpMixin, dashboardApiMixin, deprovisionMixin, preprovisionMixin, provisionMixin,) {
}