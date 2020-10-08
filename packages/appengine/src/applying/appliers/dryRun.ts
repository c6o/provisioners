import { ProvisionerManager } from '@provisioner/common'
import { IDebugger } from 'debug'
import { Applier } from '..'

export class DryRunApplier implements Applier {

    async apply(namespace: string, spec: any, manager : ProvisionerManager, debug: IDebugger) {
            debug('Dry Run details...')
            debug(`namespace:${namespace}`)
            debug('spec:\n', spec)
    }
}