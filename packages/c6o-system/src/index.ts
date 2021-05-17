import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { IstioProvisioner } from '@provisioner/istio'
import { SystemProvisioner } from './contracts'

export * from './contracts'

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
export * from './constants'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends SystemProvisioner {

}
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
    metricsMixin)
{

    getIstioProvisioner = async () =>
        await this.controller.resolver.getProvisioner<IstioProvisioner>('istio-system', 'istio')
}

