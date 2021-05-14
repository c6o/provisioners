import { baseProvisionerType } from './index'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {

        const namespace = this.controller.resource.metadata.namespace

        await this.controller.cluster
            .begin('Removing rabbitMQ services')
            .deleteFile('../k8s/rabbitmq_rbac.yaml', { namespace })
            .deleteFile('../k8s/{version}/rabbitmq.yaml', { namespace })
            .end()
    }
}