import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import {
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin,
    updateSystemMixin,
    createValidateMixin,
    postAppMixin,
    removeApplyMixin,
    choicesApiMixin,
    hostApiMixin,
    loggerApiMixin,
    npmApiMixin,
    metricsMixin
} from './mixins'
// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(
    postAppMixin,
    removeApplyMixin,
    createApplyMixin,
    updateApplyMixin,
    updateSystemMixin,
    createValidateMixin,
    createInquireMixin,
    choicesApiMixin,
    hostApiMixin,
    loggerApiMixin,
    npmApiMixin,
    metricsMixin) {

    newClusterId
}

export * from './constants'