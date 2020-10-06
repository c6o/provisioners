import { ProvisionerManager } from '@provisioner/common'
import * as appliers from './Appliers/'


export class ApplierFactory{
    static getApplier(type: string) : Applier {
        return new appliers[type]()
    }
}

export interface Applier {
    apply(namespace: string, spec: any, manager : ProvisionerManager, verbose: boolean)
}
