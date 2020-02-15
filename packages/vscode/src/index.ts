import { mix } from "@traxitt/common"
import { ProvisionerBase } from "@provisioner/common"
import { deprovisionMixin} from "./deprovision"
import { preprovisionMixin} from "./preprovision"
import { provisionMixin} from "./provision"
// import { helpMixin} from "./help"
import { execMixin} from "./exec"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with( preprovisionMixin, deprovisionMixin, provisionMixin, execMixin) {
}