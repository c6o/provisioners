import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin,
    createValidateMixin,
    createAppPostMixin,
    removeApplyMixin,
    choicesApiMixin,
    loggerApiMixin
} from './mixins'
// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(
    createAppPostMixin,
    removeApplyMixin,
    createApplyMixin,
    updateApplyMixin,
    createValidateMixin,
    createInquireMixin,
    choicesApiMixin,
    loggerApiMixin) {
}