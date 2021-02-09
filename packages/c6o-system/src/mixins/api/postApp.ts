import { AppDocument } from '@provisioner/contracts'
import { baseProvisionerType } from '../../'
import createDebug from 'debug'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = createDebug('c6o-system:api:postAppMixin:')

export const postAppMixin = (base: baseProvisionerType) => class extends base {

    async postCreateApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Creating App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.upsertVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
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
            await istioProvisioner.upsertVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()
        }
    }
}