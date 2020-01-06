import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { exec } from 'child_process'
import { ensureNamespaceExists } from '@provisioner/common'

const debug = createDebug()

let namespace
let devPods
let devService
let externalIP

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)

    await ensureDevPodIsInstalled(cluster, spec)
    await ensurePodIsRunning(cluster)
    await ensureLoadBlanacerIP(cluster)
    
    launchVSCode()
}

function init(spec) {
    namespace = spec.namespace.metadata.name

    devPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                app: 'vscode'
            }
        }
    }

    devService = {
        kind: 'Service',
        apiVersion: 'v1',
        metadata: {
            namespace,
            labels: {
                app: 'vscode'
            }
        }
    }
}

async function ensureDevPodIsInstalled(cluster: Cluster, spec) {

    const env = spec.options.env || 'node'
    const image = spec.options.img || `traxitt/${env}-dev`

    await cluster
            .begin(`Install dev services`)
                .list(devPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no vscode pods running
                            processor
                                .upsertFile('../k8s/pvc.yaml', { namespace })
                                .upsertFile('../k8s/pod.yaml', { namespace, image })
                                .upsertFile('../k8s/svc.yaml', { namespace })

                        }
                })
            .end()
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensurePodIsRunning(cluster: Cluster) {
    await cluster.
            begin(`Ensure pod is running`)
                .beginWatch(devPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
}

/** Watches pods and ensures that the loadbalancer has an IP address */
async function ensureLoadBlanacerIP(cluster: Cluster) {
    await cluster.
            begin(`Fetch external IP`)
                .beginWatch(devService)
                .whenWatch(({ obj }) =>  obj.status?.loadBalancer?.ingress?.length && obj.status?.loadBalancer?.ingress[0].ip, (processor, service) => {
                    externalIP = service.status.loadBalancer.ingress[0].ip
                    processor.endWatch()
                })
            .end()
}

function launchVSCode() {
    exec(`code --folder-uri vscode-remote://ssh-remote%2Broot@${externalIP}/data`)
}