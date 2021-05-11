import { Buffer } from 'buffer'
import { processPassword } from '@provisioner/common'
import { baseProvisionerType } from '../index'

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
        await this.installOdoo()
        await this.ensureOdooIsRunning()
    }

    async installOdoo() {


        const args = {
            databaseUsername: Buffer.from('admin').toString('base64'),
            databasePassword: Buffer.from(processPassword()).toString('base64'),
            namespace: this.serviceNamespace,
            databaseSize: this.spec.databaseSize,
            shopAddonsDatabaseSize: this.spec.shopAddonsDatabaseSize
        }

        if (this.edition == 'latest') {
            await this.cluster
            .begin('Installing Odoo Volume Claims')
            .addOwner(this.document)
            .upsertFile(`../../k8s/${this.edition}/3-pvc.yaml`, args)
            .end()
        }

        await this.cluster
            .begin('Installing Odoo Deployment')
            .addOwner(this.document)
            .upsertFile(`../../k8s/${this.edition}/1-deployment.yaml`, args)
            .end()

        await this.cluster
            .begin('Installing Odoo Networking Services')
            .addOwner(this.document)
            .upsertFile(`../../k8s/${this.edition}/2-service.yaml`, args)
            .end()



    }

    async ensureOdooIsRunning() {
        await this.cluster.
            begin('Ensure Odoo services are running')
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}