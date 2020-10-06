import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '../'

export class DryRunApplier implements Applier {

    async apply(namespace: string, spec: any, manager : ProvisionerManager, verbose: boolean) {
        if(verbose) {
            console.log('Dry Run details...')
            console.log(`namespace:${namespace}`)
            console.log('spec:\n', spec)
        }

    }
}