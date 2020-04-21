import { baseProvisionerType } from '../index'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    
    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureElasticsearchIsInstalled()
        await this.ensureElasticsearchIsRunning()
    }

    get elasticsearchPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'elasticsearch'
                }
            }
        }
    }

    async ensureElasticsearchIsInstalled() {
        const storage = this.spec.storage || '1Gi'
        const namespace = this.serviceNamespace

        await this.manager.cluster
            .begin('Install logging (ELK) services')
                .list(this.elasticsearchPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('Installing logging')
                        processor
                            .upsertFile('../../k8s/elasticsearch.yaml', { namespace, storage })
                            .upsertFile('../../k8s/fluentd.yaml', { namespace })
                            .upsertFile('../../k8s/kibana.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureElasticsearchIsRunning() {
        debug('Ensuring Elasticsearch is running')
        await this.manager.cluster
            .begin('Ensure an Elasticsearch statefulset instance is running')
                .beginWatch(this.elasticsearchPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}