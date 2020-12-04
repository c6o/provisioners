import { AppObject, ProvisionerManager } from '@provisioner/common'
import * as appliers from './appliers'


export class ApplierFactory{
    static getApplier(type: string) : Applier {
        return new appliers[type]()
    }
}

export interface Applier {
    apply(manifest: AppObject, manager : ProvisionerManager)
}
