import { baseProvisionerType } from './index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get etcdPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { name: 'etcd' }
            }
        }
    }

    get etcdOperatorPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: { name: 'etcd-operator' }
            }
        }
    }

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureEtcdOperatorIsInstalled()
        await this.ensurePodIsRunning(this.etcdOperatorPods, 'ensure etcd operator is running')
        await this.ensureEtcdIsInstalled()
        await this.ensurePodIsRunning(this.etcdPods, 'ensure etcd is running')
    }

    async ensureEtcdOperatorIsInstalled() {

        const namespace = this.serviceNamespace

        await this.cluster
            .begin(`Install etcd operator services`)
            .list(this.etcdOperatorPods)
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

    async ensureEtcdIsInstalled() {
        const namespace = this.serviceNamespace

        await this.cluster
            .begin(`Install etcd services`)
            .list(this.etcdPods)
            .do((result, processor) => {

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
    async ensurePodIsRunning(podSpec, message) {
        // obj.metadata.name == 'etcd-0'
        await this.cluster.
            begin(message)
                .beginWatch(podSpec)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}
