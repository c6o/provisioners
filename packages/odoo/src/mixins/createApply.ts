import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'odoo-shop'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installOdoo()
        await this.ensureOdooIsRunning()
    }

    async installOdoo() {

        const args = {
            databaseUsername: Buffer.from('admin').toString('base64'),
            databasePassword: Buffer.from(super.processPassword()).toString('base64'),
            namespace:  this.serviceNamespace
        }

        await this.manager.cluster
            .begin('Install Odoo Deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/preview/1-deployment.yaml', args)
            .end()

        await this.manager.cluster
            .begin('Install Odoo Networking Services')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/preview/2-service.yaml', args)
            .end()

    }

    async ensureOdooIsRunning() {
        await this.manager.cluster.
            begin('Ensure Odoo services are running')
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}