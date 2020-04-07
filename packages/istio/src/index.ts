import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import {
    askMixin,
    deprovisionMixin,
    preConfigureMixin,
    preprovisionMixin,
    provisionMixin,
    gatewayApiMixin,
    grafanaMixin,
    virtualServiceApiMixin,
    httpsRedirectApiMixin
} from "./mixins"

// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(askMixin, deprovisionMixin, preConfigureMixin, preprovisionMixin, provisionMixin, gatewayApiMixin, grafanaMixin, httpsRedirectApiMixin, virtualServiceApiMixin) {
}