import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    removeInquireMixin,
    removeApplyMixin,
    createInquireMixin,
    createValidateMixin,
    createApplyMixin,
    helpMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(
    removeInquireMixin,
    removeApplyMixin,
    createInquireMixin,
    createValidateMixin,
    createApplyMixin,
    helpMixin,) {
}