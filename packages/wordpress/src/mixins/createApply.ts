import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get wordpressPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'wordpress'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installWordpress()
        await this.ensureWordpressIsRunning()
    }

    async installWordpress() {
        const namespace = this.serviceNamespace

        const {
            username,
            password,
        } = this.spec

        const user = Buffer.from(username).toString('base64')
        const pass = Buffer.from(password).toString('base64')

        await this.manager.cluster
            .begin('Install MySql secrets')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/1-secret.yaml', { namespace, username : user, password : pass })
            .end()

        await this.manager.cluster
            .begin('Install MySql deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/2-mysql-deployment.yaml', { namespace })
            .end()

        await this.manager.cluster
            .begin('Install Wordpress deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/3-wordpress-deployment.yaml', { namespace })
            .end()


        await this.manager.cluster
            .begin('Install NodePort')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/4-service.yaml', { namespace })
            .end()

    }

    async ensureWordpressIsRunning() {
        await this.manager.cluster.
            begin('Ensure Wordpress services are running')
            .beginWatch(this.wordpressPods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}