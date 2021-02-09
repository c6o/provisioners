import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, createValidateMixin) {

    get isLatest() { return this.edition === 'latest' }

}