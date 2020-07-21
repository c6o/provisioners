import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const createAppPostMixin = (base: baseProvisionerType) => class extends base {

    async createAppPost(app: AppDocument) {

        if (app.spec.routes?.simple) {
            this.manager.status?.push(`Setting up app ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }
}
