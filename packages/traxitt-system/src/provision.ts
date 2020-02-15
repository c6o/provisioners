import { baseProvisionerType } from './index'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

export const provisionMixin = (base: baseProvisionerType) => class extends base {

    async provision() {
        debug('provision called', this.spec)

        await this.ensureServiceNamespacesExist()

        const tag = this.options.tag || 'canary'

        await this.manager.cluster
        .begin(`Install pub/sub system`)
            .upsertFile('../k8s/publisher.yaml', { tag })
            .upsertFile('../k8s/subscriber.yaml', { tag })
        .end()
    }
}