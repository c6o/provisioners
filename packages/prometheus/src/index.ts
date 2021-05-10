import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'
import { PrometheusProvisioner } from './contracts'

export * from './contracts'

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

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase & PrometheusProvisioner

export class Provisioner extends mix(ProvisionerBase).with(preAskMixin,
    askMixin, apiMixin, helpMixin, removeInquireMixin, removeApplyMixin, createInquireMixin, createApplyMixin,) {

    prometheusNamespace: string
    jobConfig
    removeJobName

    certName
    certFiles


    simpleServiceProvided(answers) { return !!(super.spec.simpleService || answers.simple) }
}