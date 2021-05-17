import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { GrafanaProvisioner } from './contracts'

export * from './contracts'

import {
    dashboardApiMixin,
    removeApplyMixin,
    removeInquireMixin,
    helpMixin,
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase & GrafanaProvisioner

export class Provisioner extends mix(ProvisionerBase).with(helpMixin, dashboardApiMixin, removeInquireMixin, removeApplyMixin, createInquireMixin, createApplyMixin, updateApplyMixin,) {
}
