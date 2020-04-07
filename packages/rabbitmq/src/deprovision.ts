import { baseProvisionerType } from './index'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {

        const namespace = this.deprovisionNamespace

        await this.manager.cluster
            .begin('Removing rabbitMQ services')
            .deleteFile('../k8s/rabbitmq_rbac.yaml', { namespace })
            .deleteFile('../k8s/{version}/rabbitmq.yaml', { namespace })
            .end()
    }
}