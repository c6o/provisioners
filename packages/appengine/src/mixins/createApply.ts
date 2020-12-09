import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'
import { AppObject, AppManifest, TimingReporter } from '../appObject'

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
        const manifest = new AppObject(this.manager.document) as AppManifest
        this.state.startTimer('apply')
        await this.ensureServiceNamespacesExist()
        await this.installApp(manifest)
        await this.ensureAppIsRunning(manifest)
        this.state.endTimer('apply')

        this.helper.PrettyPrintJsonFile(manifest, `${manifest.appId}-completed-manifest`)
        this.helper.PrettyPrintJsonFile(this.state, `${manifest.appId}-completed-state`)

        new TimingReporter().report(this.state)
    }

    async installApp(manifest: AppManifest) {
        this.state.startTimer('install')
        const applierType = manifest.provisioner.applier || 'ObjectApplier'
        await applierFactory.getApplier(applierType).apply(manifest, this.state, this.manager)
        this.state.endTimer('install')
    }

    async ensureAppIsRunning(manifest: AppManifest) {
        this.state.startTimer('watch-pod')
        await this.manager.cluster.
            begin(`Ensure ${manifest.displayName} services are running`)
            .beginWatch(this.pods(manifest.namespace, manifest.appId))
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
        this.state.endTimer('watch-pod')
    }

}