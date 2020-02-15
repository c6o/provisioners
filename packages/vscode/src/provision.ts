import { createDebug } from '@traxitt/common'
import { baseProvisionerType } from './index'
import { exec } from 'child_process'

const debug = createDebug()

export const provisionMixin = (base: baseProvisionerType) => class extends base {
    runningPod
    externalIP

    get devPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'vscode'
                }
            }
        }
    }

    get devService() {
        return {
            kind: 'Service',
            apiVersion: 'v1',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'vscode'
                }
            }
        }
    }

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureDevPodIsInstalled()
        await this.ensurePodIsRunning()
        await this.ensureLoadBalancerIP()
        await this.copyAuthorizationKeys()

        // and launch vs code
        if (this.spec.launch) {
            this.launchVSCode()
        }
    }

    async ensureDevPodIsInstalled() {

        const namespace = this.serviceNamespace
        const image = this.spec.img
        const storage = this.spec.storage
        const publicKey = this.spec.publicKey

        await this.manager.cluster
            .begin(`Install dev services`)
            .list(this.devPods)
            .do((result, processor) => {

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

    async ensurePodIsRunning() {
        await this.manager.cluster
            .begin(`Ensure pod is running`)
            .beginWatch(this.devPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                this.runningPod = pod
                processor.endWatch()
            })
            .end()
    }

    /** Watches pods and ensures that the loadbalancer has an IP address */
    async  ensureLoadBalancerIP() {
        await this.manager.cluster.
            begin(`Fetch external IP`)
            .beginWatch(this.devService)
            .whenWatch(({ obj }) => obj.status?.loadBalancer?.ingress?.length && obj.status?.loadBalancer?.ingress[0].ip, (processor, service) => {
                this.externalIP = service.status.loadBalancer.ingress[0].ip
                processor.endWatch()
            })
            .end()
    }

    async copyAuthorizationKeys() {
        await this.manager.cluster.
            begin(`Copy authorization_keys`)
            .exec(this.runningPod, ['mkdir', '-p', '/data/.ssh'])
            .exec(this.runningPod, ['cp', '/data/keys/authorized_keys', '/data/.ssh'])
            .end()
    }

    launchVSCode() {
        exec(`code --folder-uri vscode-remote://ssh-remote%2Broot@${this.externalIP}/data`)
    }
}