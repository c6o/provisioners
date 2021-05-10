import { baseProvisionerType } from './index'
import { exec } from 'child_process'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
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

    async createApply() {
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

        await this.cluster
            .begin('Install dev services')
            .list(this.devPods)
            .do((result, processor) => {

                const namespace = this.serviceNamespace
                const {
                    storageClass,
                    storage,
                    img,
                    publicKey } = this.spec

                if (result?.object?.items?.length == 0) {
                    // There are no vscode pods running
                    processor
                        .upsertFile('../k8s/configmap.yaml', { namespace, publicKey })
                        .upsertFile('../k8s/pvc.yaml', { namespace, storage, storageClass })
                        .upsertFile('../k8s/deployment.yaml', { namespace, img })
                        .upsertFile('../k8s/svc.yaml', { namespace })
                        .upsertFile('../k8s/devSvc.yaml', { namespace })
                }
            })
            .end()
    }

    async ensurePodIsRunning() {
        await this.cluster
            .begin('Ensure pod is running')
            .beginWatch(this.devPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                this.runningPod = pod
                processor.endWatch()
            })
            .end()
    }

    /** Watches pods and ensures that the loadbalancer has an IP address */
    async  ensureLoadBalancerIP() {
        await this.cluster.
            begin('Fetch external IP')
            .beginWatch(this.devService)
            .whenWatch(({ obj }) => obj.status?.loadBalancer?.ingress?.length && obj.status?.loadBalancer?.ingress[0].ip, (processor, service) => {
                this.externalIP = service.status.loadBalancer.ingress[0].ip
                processor.endWatch()
            })
            .end()
    }

    async copyAuthorizationKeys() {
        await this.cluster.
            begin('Copy authorization_keys')
            .exec(this.runningPod, ['mkdir', '-p', '/data/.ssh'])
            .exec(this.runningPod, ['cp', '/data/keys/authorized_keys', '/data/.ssh'])
            .end()
    }

    launchVSCode() {
        exec(`code --folder-uri vscode-remote://ssh-remote%2Broot@${this.externalIP}/data`)
    }
}