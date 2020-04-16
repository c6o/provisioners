import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    removeInquireMixin,
    removeApplyMixin,
    createInquireMixin,
    createApplyMixin,
    helpMixin,
    apiMixin,
    askMixin,
    preAskMixin,
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(preAskMixin,
    askMixin, apiMixin, helpMixin, removeInquireMixin, removeApplyMixin, createInquireMixin, createApplyMixin,) {
}