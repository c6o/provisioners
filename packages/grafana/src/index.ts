import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    dashboardApiMixin,
    removeApplyMixin,
    removeInquireMixin,
    helpMixin,
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export class Provisioner extends mix(ProvisionerBase).with(helpMixin, dashboardApiMixin, removeInquireMixin, removeApplyMixin, createInquireMixin, createApplyMixin, updateApplyMixin,) {
}
