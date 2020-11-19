import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    createApplyMixin,
    removeInquireMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
    // @ts-ignore
    isLatest: () => string
    ghostPods: () => string
    createApply: () => Promise<void>
    installGhost: () => Promise<void>
    ensureGhostIsRunning: () => Promise<void>
}

export class Provisioner extends mix(ProvisionerBase)
    .with(createApplyMixin, removeInquireMixin, updateApplyMixin) {
    // @ts-ignore
    get isLatest() { return this.editionId === 'latest' }
}
