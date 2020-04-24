import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    createInquireMixin,
    createApplyMixin,
    createValidateMixin,
    createAppPostMixin,
    removeApplyMixin
} from './mixins'
// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(createAppPostMixin, removeApplyMixin, createApplyMixin, createValidateMixin, createInquireMixin) {
}