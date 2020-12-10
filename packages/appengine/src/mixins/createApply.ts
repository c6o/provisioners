import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'
import { AppObject, AppManifest, TimingReporter, AppEngineState } from '../appObject'

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

        if (!this.state) {
            this.state = new AppEngineState(
                {
                    name: manifest.name,
                    appId: manifest.appId,
                    partOf: manifest.appId,
                    edition: manifest.edition,
                })

        }
        debug('APPX createApply - manifest', manifest)
        debug('APPX createApply - state', this.state)

        try {
            this.state.startTimer('apply')
            await this.ensureServiceNamespacesExist()
            await this.installApp(manifest)
            await this.ensureAppIsRunning(manifest)
            this.state.endTimer('apply')
            new TimingReporter().report(this.state)
        } catch (e) {
            debug('APPX createApply', e)
        }
    }

    async installApp(manifest: AppManifest) {
        try {

            this.state.startTimer('install')
            const applierType = manifest.provisioner.applier || 'ObjectApplier'
            await applierFactory.getApplier(applierType).apply(manifest, this.state, this.manager)
            if((manifest as any).fieldTypes) delete (manifest as any).fieldTypes
            this.state.endTimer('install')
        } catch (e) {
            debug('APPX installApp', e)
        }
    }

    async ensureAppIsRunning(manifest: AppManifest) {
        try {

            this.state.startTimer('watch-pod')
            await this.manager.cluster.
                begin(`Ensure ${manifest.displayName} services are running`)
                .beginWatch(this.pods(manifest.namespace, manifest.appId))
                .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                    processor.endWatch()
                })
                .end()
            this.state.endTimer('watch-pod')
        } catch (e) {
            debug('APPX ensureAppIsRunning', e)
        }
    }

}