import { baseProvisionerType } from '../index'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'docker-registry'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installDockerRegistry()
        await this.ensureDockerRegistryIsRunning()
    }

    async installDockerRegistry() {
        const namespace = this.serviceNamespace

        await super.cluster
            .begin('Install docker-registry secrets')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/1-secret.yaml', { namespace })
            .end()


        await super.cluster
            .begin('Install docker-registry configuration')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/2-configmap.yaml', { namespace })
            .end()

        await super.cluster
            .begin('Install docker-registry networking services')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/3-service.yaml', { namespace })
            .end()


        await super.cluster
            .begin('Install docker-registry deployment')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/4-deployment.yaml', { namespace })
            .end()

    }

    async ensureDockerRegistryIsRunning() {
        await super.cluster.
            begin('Ensure docker-registry services are running')
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}