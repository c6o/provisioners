import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const routingMixin = (base: baseProvisionerType) => class extends base {

    async postCreateApp(app: AppDocument) {
        if (app.spec.routes?.length !== 0) {
            this.manager.status?.push(`Setting up app ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }

    async postRemoveApp(app: AppDocument) {
        if (app.spec.routes?.length !== 0) {
            this.manager.status?.push(`Tearing down app ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.removeVirtualService(app)
            this.manager.status?.pop()
        }
    }

    async postUpdateApp(app: AppDocument) {
        if (app.spec.routes?.length !== 0) {
            this.manager.status?.push(`Updating app ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }

    async preCreateApp(app: AppDocument) {
        // placeholder
    }

    async preRemoveApp(app: AppDocument) {
        // placeholder
    }

    async preUpdateApp(app: AppDocument) {
        // placeholder
    }
}