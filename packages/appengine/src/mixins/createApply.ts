import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'
import { AppObject, AppManifest, TimingReporter, AppEngineState, Helper } from '../appObject'

const debug = createDebug('@appengine:createApply')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    writeToLog(title, ...args) {
        const msg = `APPX - ${title} - ${JSON.stringify(args).split('\n').join('')}`
        debug(msg)
        console.log(msg)
    }

    helper = new Helper()

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

        this.writeToLog('createApply - manifest', manifest)
        this.writeToLog('createApply - state', this.state)

        this.state.startTimer('apply')
        await this.ensureServiceNamespacesExist()
        await this.installApp(manifest)
        await this.ensureAppIsRunning(manifest)
        this.state.endTimer('apply')
        new TimingReporter().report(this.state)
    }

    async installApp(manifest: AppManifest) {
        this.state.startTimer('install')
        const applierType = manifest.provisioner.applier || 'ObjectApplier'
        await applierFactory.getApplier(applierType).apply(manifest, this.state, this.manager)
        if((manifest as any).fieldTypes) delete (manifest as any).fieldTypes
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