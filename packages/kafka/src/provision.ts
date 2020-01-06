import { createDebug, asyncForEach } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

let namespace
let kafkaBrokerPods
let kafkaZookeeperPods
let runningPod

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)

    await ensureKafkaIsInstalled(cluster, spec)
    await ensureKafkaIsRunning(cluster)
}

function init(spec) {
    namespace = spec.namespace.metadata.name

    kafkaBrokerPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                'app.kubernetes.io/component':'kafka-broker'
            }
        }
    }

    kafkaZookeeperPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                app: 'zookeeper'
            }
        }
    }
}

async function ensureKafkaIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install kafka services`)
                .list(kafkaBrokerPods)
                .do( (result, processor) => {

                    debugger
                    if (result?.object?.items?.length == 0) {
                            // There are no kafka brokers
                            // Install kafka
                            processor
                                .upsertFile('../k8s/kafka-complete.yaml', { namespace })

                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureKafkaIsRunning(cluster: Cluster) {

    const zookeeper = cluster.
            begin(`Ensure a kafka zookeeper is running`)
                .beginWatch(kafkaZookeeperPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()

    const broker = cluster.
            begin(`Ensure a kafka broker is running`)
                .beginWatch(kafkaBrokerPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()

    await Promise.all([zookeeper, broker])
}
