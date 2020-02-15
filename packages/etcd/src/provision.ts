import { baseProvisionerType } from './index'

export const provisionMixin = (base: baseProvisionerType) => class extends base {

    get etcPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'etcd'
                }
            }
        }
    }

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureEtcdIsInstalled()
        await this.ensureEtcdIsRunning()
    }

    async ensureEtcdIsInstalled() {

        const namespace = this.serviceNamespace
        await this.manager.cluster
            .begin(`Install etcd services`)
            .list(this.etcPods)
            .do((result, processor) => {

                if (result?.object?.items?.length == 0) {
                    // There are no etcd pods

                    const replicas = this.spec.replicas || 3
                    const storageClass = this.spec.storageClass || "do-block-storage"

                    const settings = {
                        namespace,
                        replicas,
                        storageClass,
                        peers: "etcd-0=http://etcd-0.etcd:2380,etcd-1=http://etcd-1.etcd:2380,etcd-2=http://etcd-2.etcd:2380",
                    }

                    // Install etcd
                    processor
                        .upsertFile('../k8s/{version}/etcd.yaml', settings)
                }
            })
            .end()
    }

    /** Watches pods and ensures that a pod is running and sets runningPod */
    async ensureEtcdIsRunning() {
        await this.manager.cluster.
            begin(`Ensure etcd services are running`)
            .beginWatch(this.etcPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                processor.endWatch()
            })
            .end()
    }

}
