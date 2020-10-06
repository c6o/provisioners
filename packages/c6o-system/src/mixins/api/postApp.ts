import { AppDocument } from '@provisioner/common'
import { baseProvisionerType } from '../../'

export const postAppMixin = (base: baseProvisionerType) => class extends base {

    async postCreateApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Creating App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()

            const httpRoute = app.spec.routes.find(route => route.type === 'http')
            if (httpRoute) {
                this.manager.status?.push(`Adding app ${app.metadata.namespace} ingress`)
                const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
                await istioProvisioner.addJwtToRuleSection(app, app.metadata.name, app.metadata.namespace, httpRoute.http?.public)
                this.manager.status?.pop()
            }
        }
    }

    async postRemoveApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Removing App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.removeVirtualService(app)
            this.manager.status?.pop()

            const httpRoute = app.spec.routes.find(route => route.type === 'http')
            if (httpRoute) {
                this.manager.status?.push(`Removing app ${app.metadata.namespace} ingress`)
                const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
                await istioProvisioner.removeJwtToRuleSection(app, app.metadata.name, app.metadata.namespace)
                this.manager.status?.pop()
            }
        }
    }

    async postUpdateApp(app: AppDocument) {
        if (app.spec.routes?.length) {
            this.manager.status?.push(`Updating App ${app.metadata.namespace} routes`)
            const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
            await istioProvisioner.createVirtualService(app, 'c6o-system/' + this.SYSTEM_GATEWAY_NAME)
            this.manager.status?.pop()

            const httpRoute = app.spec.routes.find(route => route.type === "http")
            if (httpRoute) {
                this.manager.status?.push(`Updating app ${app.metadata.namespace} ingress`)
                const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
                await istioProvisioner.addJwtToRuleSection(app, app.metadata.name, app.metadata.namespace, httpRoute.http?.public)
                this.manager.status?.pop()
            }
        }
    }
}