import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { IstioProvisioner } from '@provisioner/istio'
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

export type baseProvisionerType = new (...a) => Provisioner

export interface Provisioner extends ProvisionerBase {

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

    newClusterId

    getIstioProvisioner = async () =>
        await this.manager.getAppProvisioner<IstioProvisioner>('istio', 'istio-system')
}

