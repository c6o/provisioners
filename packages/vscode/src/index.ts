import { mix } from '@traxitt/common'
import { ProvisionerBase } from '@provisioner/common'
import { predeprovisionMixin} from './predeprovision'
import { deprovisionMixin} from './deprovision'
import { preprovisionMixin} from './preprovision'
import { provisionMixin} from './provision'
import { execMixin} from './exec'
import { helpMixin} from './help'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with( preprovisionMixin, predeprovisionMixin, deprovisionMixin, provisionMixin, execMixin, helpMixin) {
}