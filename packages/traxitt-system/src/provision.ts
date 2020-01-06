import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    debug('provision called', spec)

    const tag = cluster.options.tag || 'canary'

    await cluster
            .begin(`Install pub/sub system`)
            .upsertFile('../k8s/publisher.yaml', { tag })
            .upsertFile('../k8s/subscriber.yaml', { tag })
        .end()
}