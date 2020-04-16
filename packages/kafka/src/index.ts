import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import { removeApplyMixin,} from './mixins/removeApply'
import { createApplyMixin} from './mixins/createApply'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(removeApplyMixin, createApplyMixin,) {
}