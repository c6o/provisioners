import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import { removeApplyMixin} from './removeApply'
import { createApplyMixin} from './createApply'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(removeApplyMixin, createApplyMixin,) {
}