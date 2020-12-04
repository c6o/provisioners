import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'
import * as fs from 'fs'
import { AppObject } from '@provisioner/common'

const debug = createDebug('@appengine:createApply')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    pods(namespace, app) {
        return {
            kind: 'Pod',
            metadata: {
                namespace,
                labels: {
                    app
                }
            }
        }
    }
    async createApply() {
        const manifest = new AppObject(this.manager.document)
        manifest.state.timing.apply = { start: new Date() }

        await this.ensureServiceNamespacesExist()
        await this.installApp(manifest)
        await this.ensureAppIsRunning(manifest)

        manifest.state.timing.apply.end = new Date()
    }

    async installApp(manifest: AppObject) {
        manifest.state.timing.install =  { start: new Date() }
        const applierType = manifest.provisioner.applier || 'ObjectApplier'
        await applierFactory.getApplier(applierType).apply(manifest, this.manager)
        manifest.state.timing.install.end = new Date()
    }

    async ensureAppIsRunning(manifest: AppObject) {
        await this.manager.cluster.
            begin(`Ensure ${manifest.displayName} services are running`)
            .beginWatch(this.pods(manifest.namespace, manifest.appId))
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }

}