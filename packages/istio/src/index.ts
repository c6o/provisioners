import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { IstioProvisioner } from './contracts'
import {
    removeApplyMixin,
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin,
    grafanaMixin,
    gatewayApiMixin,
    virtualServiceApiMixin,
    prometheusApiMixin,
    choicesApiMixin,
    httpsRedirectApiMixin
} from './mixins'

export * from './contracts'

// TODO: import { helpMixin} from "./help"

export type baseProvisionerType = new (...a) => Provisioner & IstioProvisioner

export class Provisioner extends mix(ProvisionerBase).with(
    removeApplyMixin,
    createInquireMixin,
    createApplyMixin,
    updateApplyMixin,
    grafanaMixin,
    gatewayApiMixin,
    prometheusApiMixin,
    choicesApiMixin,
    httpsRedirectApiMixin,
    virtualServiceApiMixin) {
}

export * from './constants'