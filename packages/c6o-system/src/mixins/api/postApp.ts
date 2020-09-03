import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const postAppMixin = (base: baseProvisionerType) => class extends base {

    async postCreateApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Creating App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }

    async postRemoveApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Removing App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.removeVirtualService(app)
            this.manager.status?.pop()
        }
    }

    async postUpdateApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Updating App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }
}