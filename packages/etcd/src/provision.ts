import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'

const debug = createDebug()

let namespace
let etcdPods
let runningPod

export async function provision(cluster: Cluster, spec) {
    init(spec)
    await ensureEtcdIsInstalled(cluster, spec)
    await ensureEtcdIsRunning(cluster)

}

function init(spec) {
    namespace = spec.namespace.metadata.name

    etcdPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                app: 'etcd'
            }
        }
    }
}

async function ensureEtcdIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install etcd services`)
                .list(etcdPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no etcd pods

                            const replicas = spec.replicas || 3
                            const storageClass = spec.storageClass || "do-block-storage"
                        
                            const settings = {
                                namespace,
                                replicas,
                                storageClass,
                                peers: "etcd-0=http://etcd-0.etcd:2380,etcd-1=http://etcd-1.etcd:2380,etcd-2=http://etcd-2.etcd:2380",
                            }

                            // Install etcd
                            processor
                                .apply('../k8s/{version}/etcd.yaml', settings)
                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureEtcdIsRunning(cluster: Cluster) {
    await cluster.
            begin(`Ensure etcd services are running`)
                .beginWatch(etcdPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    runningPod = pod
                    processor.endWatch()
                })
            .end()
}