import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(cluster: Cluster, spec) {
    debug('provision called', spec)

    const tag = cluster.options.tag || 'canary'

    await cluster
            .begin(`Install pub/sub system`)
            .apply('../k8s/publisher.yaml', { tag })
            .apply('../k8s/subscriber.yaml', { tag })
        .end()
}