import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin,
    updateSystemMixin,
    createValidateMixin,
    createAppPostMixin,
    removeApplyMixin,
    choicesApiMixin,
    loggerApiMixin,
    npmApiMixin,
    metricsMixin
} from './mixins'
// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(
    createAppPostMixin,
    removeApplyMixin,
    createApplyMixin,
    updateApplyMixin,
    updateSystemMixin,
    createValidateMixin,
    createInquireMixin,
    choicesApiMixin,
    loggerApiMixin,
    npmApiMixin,
    metricsMixin) {
}