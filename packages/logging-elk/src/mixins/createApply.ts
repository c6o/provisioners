import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('logging-elk:createApply:')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    
    async createApply() {
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
        
        const namespace = this.serviceNamespace
        const {
            storageClass,
            storage,
            k8sLogIndexPrefix } = this.spec

        await this.controller.cluster
            .begin('Install logging (ELK) services')
                .list(this.elasticsearchPods)
                .do((result, processor) => {
                    if (result?.object?.items?.length == 0) {
                        debug('Installing logging')
                        processor
                            .upsertFile('../../k8s/elasticsearch.yaml', { namespace, storage, storageClass })
                            .upsertFile('../../k8s/fluentd.yaml', { namespace, k8sLogIndexPrefix })
                            .upsertFile('../../k8s/kibana.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureElasticsearchIsRunning() {
        debug('Ensuring Elasticsearch is running')
        await this.controller.cluster
            .begin('Ensure an Elasticsearch statefulset instance is running')
                .beginWatch(this.elasticsearchPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}