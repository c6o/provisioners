import { ProvisionerManager } from '@provisioner/common'
import { AppEngineState, AppManifest } from '../appObject'
import * as appliers from './appliers'


export class ApplierFactory{
    static getApplier(type: string) : Applier {
        return new appliers[type]()
    }
}

export interface Applier {
    apply(manifest: AppManifest, state: AppEngineState, manager : ProvisionerManager)
}
