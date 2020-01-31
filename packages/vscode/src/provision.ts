import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { exec } from 'child_process'
import { ensureNamespaceExists } from '@provisioner/common'
import { promises as fs } from 'fs'
import { homedir } from 'os'
import * as path from 'path'


const debug = createDebug()

let namespace
let devPods
let runningPod
let devService
let externalIP

export async function provision(cluster: Cluster, spec) {

    await ensureNamespaceExists(cluster, spec)

    init(spec)

    await ensureDevPodIsInstalled(cluster, spec)
    await ensurePodIsRunning(cluster)
    await ensureLoadBalancerIP(cluster)
    await copyAuthorizationKeys(cluster)
    
    // and launch vs code
    if (spec.launch) {
        launchVSCode()
    }
    // return IP address for browser/app
    return {
        externalIP
    }
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
    const storage = spec.options.storage || `4Gi`
    let publicKey = spec.publicKey

    if (!publicKey)
        publicKey = await fs.readFile(resolvePath('~/.ssh/id_rsa.pub'), 'utf8')
    
    await cluster
            .begin(`Install dev services`)
                .list(devPods)
                .do( (result, processor) => {

                    if (result?.object?.items?.length == 0) {
                            // There are no vscode pods running
                            processor
                                .upsertFile('../k8s/configMap.yaml', { namespace, publicKey })
                                .upsertFile('../k8s/pvc.yaml', { namespace, storage })
                                .upsertFile('../k8s/deployment.yaml', { namespace, image })
                                .upsertFile('../k8s/svc.yaml', { namespace })
                                .upsertFile('../k8s/devSvc.yaml', { namespace })
                        }
                })
            .end()
}

function resolvePath(filePath: string) {
    if (!filePath)
        return ''

    // '~/folder/path' or '~'
    if (filePath[0] === '~' && (filePath[1] === '/' || filePath.length === 1))
        return filePath.replace('~', homedir())

    return path.resolve(filePath)
}

/** Watches pods and ensures that a pod is running and sets runningPod */
async function ensurePodIsRunning(cluster: Cluster) {
    await cluster.
            begin(`Ensure pod is running`)
                .beginWatch(devPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    runningPod = pod
                    processor.endWatch()
                })
            .end()
}

/** Watches pods and ensures that the loadbalancer has an IP address */
async function ensureLoadBalancerIP(cluster: Cluster) {
    await cluster.
            begin(`Fetch external IP`)
                .beginWatch(devService)
                .whenWatch(({ obj }) =>  obj.status?.loadBalancer?.ingress?.length && obj.status?.loadBalancer?.ingress[0].ip, (processor, service) => {
                    externalIP = service.status.loadBalancer.ingress[0].ip
                    processor.endWatch()
                })
            .end()
}

async function copyAuthorizationKeys(cluster: Cluster) {

    await cluster.
    begin(`Copy authorization_keys`)
        .exec(runningPod, ['mkdir', '-p', '/data/.ssh'])
        .exec(runningPod, ['cp', '/data/keys/authorized_keys', '/data/.ssh'])
    .end()
}

function launchVSCode() {
    exec(`code --folder-uri vscode-remote://ssh-remote%2Broot@${externalIP}/data`)
}