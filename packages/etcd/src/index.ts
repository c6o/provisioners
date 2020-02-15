import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"

import { deprovisionMixin} from "./deprovision"
import { provisionMixin} from "./provision"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(deprovisionMixin, provisionMixin,) {
}