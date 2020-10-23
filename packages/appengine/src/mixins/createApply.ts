import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'

const debug = createDebug('@appengine:createApply')

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: this.spec.name
                }
            }
        }
    }

    async createApply() {

        await this.ensureServiceNamespacesExist()
        await this.installApp()
        await this.ensureAppIsRunning()
    }

    async installApp() {

        const applierType = this.spec.applier || 'ObjectApplier'
        await applierFactory.getApplier(applierType).apply(this.serviceNamespace, this.spec, this.manager, debug)

    }

    async ensureAppIsRunning() {
        await this.manager.cluster.
            begin(`Ensure ${this.spec.name} services are running`)
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}