import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'

const debug = createDebug()

export async function deprovision(cluster: Cluster, spec) {
    debug('deprovision called', cluster)
    // Nothing really to do here
}