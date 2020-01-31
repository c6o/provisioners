import { createDebug, asyncForEach } from '@traxitt/common'
import { ensureNamespaceExists } from '@provisioner/common'
import { Cluster } from '@traxitt/kubeclient'

const debug = createDebug()

let namespace
let nodeGrafanaPods

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)

    await ensureGrafanaIsInstalled(cluster, spec)
    await ensureGrafanaIsRunning(cluster)

}

function init(spec) {
    namespace = spec.namespace.metadata.name

    nodeGrafanaPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                name: 'grafana'
            }
        }
    }
}

async function ensureGrafanaIsInstalled(cluster: Cluster, spec) {

    const storage = spec.storage || '1Gi'
    const adminUsername = spec.adminUsername || 'admin'
    const adminPassword = spec.adminPassword || 'admin'

    await cluster
        .begin(`Install Grafana services`)
        .list(nodeGrafanaPods)
        .do((result, processor) => {

            if (result?.object?.items?.length == 0) {
                // There are no Grafana pods running
                // Install Grafana
                processor
                    .upsertFile('../k8s/pvc.yaml', { namespace, storage })
                    .upsertFile('../k8s/deployment.yaml', { namespace, adminUsername, adminPassword })
                    .upsertFile('../k8s/service.yaml', { namespace })
            }
        })
        .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureGrafanaIsRunning(cluster: Cluster) {
    await cluster.
        begin(`Ensure a Grafana replica is running`)
        .beginWatch(nodeGrafanaPods)
        .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
            processor.endWatch()
        })
        .end()
}