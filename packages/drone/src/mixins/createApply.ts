import { processPassword } from '@provisioner/common'
import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'server'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.provision()
        await this.ensureProvisionerIsRunning()
    }

    async provision() {

        const data = {
            namespace : this.serviceNamespace,
            secretKey : Buffer.from(processPassword()).toString('base64'),
            gitAlwaysAuth : Buffer.from( this.spec.alwaysAuth === true ? 'true' : 'false' ).toString('base64')
        }

        Object.keys(this.spec).forEach(key => {
            if(this.spec[key] && this.spec[key] !== '' && typeof(this.spec[key]) === 'string' ) {
                data[key] = Buffer.from(this.spec[key]).toString('base64')
            }
        })

        await this.cluster
            .begin('Installing Secrets')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/1-secrets.yaml', data)
            .end()

        await this.cluster
            .begin('Installing Persistent Volume Claims')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/2-pvc.yaml', { namespace: data.namespace, storageSize: this.spec.storageSize })
            .end()

        await this.cluster
            .begin('Installing Server Deployment')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/3-server-deployment.yaml', { namespace: data.namespace })
            .end()

            await this.cluster
            .begin('Installing Runner Deployment')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/4-runner-deployment.yaml', { namespace: data.namespace })
            .end()

            await this.cluster
            .begin('Installing Networking Services')
            .addOwner(this.document)
            .upsertFile('../../k8s/latest/5-service.yaml', { namespace: data.namespace })
            .end()

    }

    async ensureProvisionerIsRunning() {
        await this.cluster.
            begin('Ensure Drone services are running')
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}