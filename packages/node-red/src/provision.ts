import { createDebug, asyncForEach } from '@traxitt/common'
import { ensureNamespaceExists } from '@provisioner/common'
import { Cluster } from '@traxitt/kubeclient'

const debug = createDebug()

let namespace
let nodeRedPods

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)
    
    await ensureNodeRedIsInstalled(cluster, spec)
    await ensureNodeRedIsRunning(cluster)

}

function init(spec) {
    namespace = spec.namespace.metadata.name

    nodeRedPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                name: 'node-red'
            }
        }
    }
}

async function ensureNodeRedIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install Node-RED services`)
                .list(nodeRedPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no node-red pods running
                            // Install node-red
                            processor
                                .upsertFile('../k8s/deployment.yaml', { namespace })
                                .upsertFile('../k8s/service.yaml', { namespace })

                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureNodeRedIsRunning(cluster: Cluster) {
    await cluster.
            begin(`Ensure a Node-RED replica is running`)
                .beginWatch(nodeRedPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
}