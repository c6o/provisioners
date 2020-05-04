import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const createAppPostMixin = (base: baseProvisionerType) => class extends base {

    async createAppPost(app: AppDocument) {

        if (app.spec.routes?.simple) {
            this.manager.status?.push(`Setting up app ${app.metadata.namespace} routes`)
            // When an app is created, we have to open ports for this app
            const istioProvisioner = await this.manager.getProvisioner('istio')
            await istioProvisioner.createVirtualService(app, 'traxitt-system/' + this.SYSTEM_GATEWAY_NAME)

            this.manager.status?.pop()
        }
    }
}
