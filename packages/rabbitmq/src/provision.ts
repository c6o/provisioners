import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

let namespace
let rabbitMQPods
let runningPod

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)
    
    await ensureRabbitMQIsInstalled(cluster, spec)
    await ensureRabbitMQIsRunning(cluster)

}

function init(spec) {
    namespace = spec.namespace.metadata.name

    rabbitMQPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                app: 'rabbitmq'
            }
        }
    }
}

async function ensureRabbitMQIsInstalled(cluster: Cluster, spec) {
    await cluster
            .begin(`Install rabbitMQ services`)
                .list(rabbitMQPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no rabbitMQ pods running
                            // Install rabbitMQ
                            processor
                                .upsertFile('../k8s/rabbitmq_rbac.yaml', { namespace })
                                .upsertFile('../k8s/{version}/rabbitmq.yaml', { namespace })

                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensureRabbitMQIsRunning(cluster: Cluster) {
    await cluster.
            begin(`Ensure a rabbitMQ replica is running`)
                .beginWatch(rabbitMQPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    runningPod = pod
                    processor.endWatch()
                })
            .end()
}

