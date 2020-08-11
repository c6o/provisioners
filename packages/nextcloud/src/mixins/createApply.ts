import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('nextCloud:createApply:')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureNextCloudIsInstalled()
        await this.ensureNextCloudIsRunning()
    }

    get nextCloudPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'nextcloud'
                }
            }
        }
    }

    async ensureNextCloudIsInstalled() {

        const namespace = this.serviceNamespace
        const {
            storageClass,
            storage,
            adminUsername,
            adminPassword,
            hostname } = this.spec

        await this.manager.cluster
            .begin('Install NextCloud services')
                .list(this.nextCloudPods)
                .do((result, processor) => {
                    debug("Made it do 'do'")
                    if (result?.object?.items?.length == 0) {
                        debug("processing objects")
                        // There are no node-red pods running
                        // Install node-red
                        processor
                            .upsertFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                            .upsertFile('../../k8s/secrets.yaml', { namespace, adminUsername, adminPassword })
                            .upsertFile('../../k8s/deployment.yaml', { namespace, hostname })
                            .upsertFile('../../k8s/service.yaml', { namespace })
                    }
                })
            .end()
    }

    async ensureNextCloudIsRunning() {
        await this.manager.cluster.
            begin('Ensure a NextCloud replica is running')
                .beginWatch(this.nextCloudPods)
                .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                    processor.endWatch()
                })
            .end()
    }
}