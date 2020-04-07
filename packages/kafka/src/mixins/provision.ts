import { baseProvisionerType } from '../index'

export const provisionMixin = (base: baseProvisionerType) => class extends base {


    get kafkaBrokerPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    'app.kubernetes.io/component':'kafka-broker'
                }
            }
        }
    }

    get kafkaZookeeperPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'zookeeper'
                }
            }
        }
    }

    async provision() {
        await this.ensureServiceNamespacesExist()
        await this.ensureKafkaIsInstalled()
        await this.ensureKafkaIsRunning()
    }

    async ensureKafkaIsInstalled() {
        const namespace = this.serviceNamespace
        await this.manager.cluster
                .begin('Install kafka services')
                    .list(this.kafkaBrokerPods)
                    .do( (result, processor) => {
    
                        if (result?.object?.items?.length == 0) {
                                // There are no kafka brokers
                                // Install kafka
                                processor
                                    .upsertFile('../../k8s/kafka-complete.yaml', { namespace })
                            }
                    })
                .end()
    }
    
    async ensureKafkaIsRunning() {
    
        const zookeeper = this.manager.cluster.
                begin('Ensure a kafka zookeeper is running')
                    .beginWatch(this.kafkaZookeeperPods)
                    .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                        processor.endWatch()
                    })
                .end()
    
        const broker = this.manager.cluster.
                begin('Ensure a kafka broker is running')
                    .beginWatch(this.kafkaBrokerPods)
                    .whenWatch(({ condition }) => condition.Ready == 'True', (processor) => {
                        processor.endWatch()
                    })
                .end()
    
        await Promise.all([zookeeper, broker])
    }
}