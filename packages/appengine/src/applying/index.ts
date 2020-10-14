import { ProvisionerManager } from '@provisioner/common'
import { IDebugger } from 'debug'
import * as appliers from './appliers'


export class ApplierFactory{
    static getApplier(type: string) : Applier {
        return new appliers[type]()
    }
}

export interface Applier {
    apply(namespace: string, spec: any, manager : ProvisionerManager, debug: IDebugger)
}
