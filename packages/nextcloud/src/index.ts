import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    removeInquireMixin,
    removeApplyMixin,
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
    helpMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(helpMixin, removeInquireMixin, removeApplyMixin, createInquireMixin, createValidateMixin, createApplyMixin,) {
}