import { mix } from 'mixwith'
import { Resource } from '@c6o/kubeclient-contracts'
import { ProvisionerBase } from '@provisioner/common'

import {
    createApplyMixin,
    removeInquireMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
    ghostPods: Resource
    installGhost(): Promise<void>
    ensureGhostIsRunning(): Promise<void>
}

export class Provisioner extends mix(ProvisionerBase)
    .with(createApplyMixin, removeInquireMixin, updateApplyMixin) {
    get isLatest() { return this.edition === 'latest' }
}
