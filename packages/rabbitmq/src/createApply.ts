import { baseProvisionerType } from './index'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureRabbitMQIsInstalled()
        await this.ensureRabbitMQIsRunning()
    }

    get rabbitMQPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'rabbitmq'
                }
            }
        }
    }

    async ensureRabbitMQIsInstalled() {
        const namespace = this.serviceNamespace

        await this.manager.cluster
            .begin('Install rabbitMQ services')
            .list(this.rabbitMQPods)
            .do((result, processor) => {

                if (result?.object?.items?.length == 0) {
                    // There are no rabbitMQ pods running
                    // Install rabbitMQ
                    processor
                        .upsertFile('../k8s/rabbitmq_rbac.yaml', { namespace })
                        // {version} seems to be broken and needs to be deprecated anyway
                        //.upsertFile('../k8s/{version}/rabbitmq.yaml', { namespace })
                        .upsertFile('../k8s/1.16/rabbitmq.yaml', { namespace })

                }
            })
            .end()
    }

    /** Watches pods and ensures that a pod is running and sets runningPod */
    async ensureRabbitMQIsRunning() {
        await this.manager.cluster.
            begin('Ensure a rabbitMQ replica is running')
            .beginWatch(this.rabbitMQPods)
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}

