import { createDebug, asyncForEach } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

let namespace
let etcdOperatorPods
let etcdPods

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)
    
    init(spec)

    await ensureEtcdOperatorIsInstalled(cluster, spec)
    await ensurePodIsRunning(cluster, etcdOperatorPods, 'ensure etcd operator is running')
    await ensureEtcdIsInstalled(cluster, spec)
    await ensurePodIsRunning(cluster, etcdPods, 'ensure etcd is running')
}

function init(spec) {
    namespace = spec.namespace.metadata.name

    etcdPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: { name: 'etcd' }
        }
    }

    etcdOperatorPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: { name: 'etcd-operator' }
        }
    }
}

async function ensureEtcdOperatorIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install etcd operator services`)
                .list(etcdOperatorPods)
                .do((result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no etcd operator pods

                            const settings = {
                                role_binding_name: 'etcd-cluster',
                                role_name: 'etcd-cluster',
                                namespace
                            }

                            // Install etcd
                            processor
                                .upsertFile('../k8s/rbac/clusterrole.yaml', settings)
                                .upsertFile('../k8s/rbac/clusterrolebinding.yaml', settings)
                                .upsertFile('../k8s/deployment.yaml', settings)

                        }
                })
            .end()
}

async function ensureEtcdIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install etcd services`)
                .list(etcdPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no etcd pods

                            const settings = {
                                role_binding_name: 'etcd-cluster',
                                role_name: 'etcd-cluster',
                                namespace
                            }
                            // Install etcd
                            processor
                                .upsertFile('../k8s/etcd-cluster.yaml', settings)

                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running */
async function ensurePodIsRunning(cluster: Cluster, podSpec, message) {
    // obj.metadata.name == 'etcd-0'
    await cluster.
            begin(message)
                .beginWatch(podSpec)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
}