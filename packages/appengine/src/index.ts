import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"
import { AppEngineState, AppManifest } from "./appObject"

import {
    createApplyMixin,
    createInquireMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
    parseInputsToSpec(args: any)
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin) {
    state: AppEngineState
    manifest: AppManifest
}