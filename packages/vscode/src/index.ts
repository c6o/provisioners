import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { removeInquireMixin} from './removeInquire'
import { removeApplyMixin} from './removeApply'
import { createInquireMixin} from './createInquire'
import { createValidateMixin} from './createValidate'
import { createApplyMixin} from './createApply'
import { execMixin} from './exec'
import { helpMixin} from './help'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(
  removeInquireMixin,
  removeApplyMixin,
  createInquireMixin,
  createValidateMixin,
  createApplyMixin,
  execMixin,
  helpMixin) {
}