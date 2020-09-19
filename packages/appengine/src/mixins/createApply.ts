import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'


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

        this.spec.env = ''

        if (this.spec.secrets) {
            this.spec.secretsContent = ''
            for (const item of this.spec.secrets) {
                if(!item.env || item.env ==='') item.env = item.name
                const value = Buffer.from(item.value).toString('base64')
                this.spec.secretsContent += `    ${item.name}: '${value}'\n`
                this.spec.env += `        - name: ${item.env}\n          valueFrom:\n            secretKeyRef:\n                name: ${this.spec.name}secrets\n                key: ${item.name}\n`
            }

            await this.manager.cluster
                .begin('Installing the Secrets')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/1-secrets.yaml', { ...this.spec, namespace: this.serviceNamespace })
                .end()
        }

        if (this.spec.configs) {
            this.spec.configsContent = ''
            for (const item of this.spec.configs) {
                if(!item.env || item.env ==='') item.env = item.name
                this.spec.configsContent += `    ${item.name}: '${item.value}'\n`
                this.spec.env += `        - name: ${item.env}\n          valueFrom:\n            configMapKeyRef:\n              name: ${this.spec.name}configs\n              key: ${item.name}\n`
            }

            await this.manager.cluster
                .begin('Installing the Configuration Settings')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/latest/2-configmap.yaml', { ...this.spec, namespace: this.serviceNamespace })
                .end()
        }

        await this.manager.cluster
            .begin('Installing Networking Services')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/3-service.yaml', { ...this.spec, namespace: this.serviceNamespace })
            .end()


        await this.manager.cluster
            .begin('Installing the Deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/4-deployment.yaml', { ...this.spec, namespace: this.serviceNamespace })
            .end()

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