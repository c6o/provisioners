import { baseProvisionerMixinType } from '../provisioner'

declare module '../provisioner' {
    export interface ProvisionerBase {
        ensureServiceNamespacesExist() : Promise<void>
        applicationNamespace : string
        serviceNamespace: string
    }
}

export const namespaceMixin = (base: baseProvisionerMixinType) => class namespaceImp extends base {

    get applicationNamespace() { return this.applicationSpec?.namespaceObject?.metadata?.name }
    get serviceNamespace() { return this.spec?.namespaceObject?.metadata?.name }

    async ensureServiceNamespacesExist() {
        if (this.spec.namespaceObject)
            return

        if (this.spec.namespace) {
            // Spec is a different namespace than application
            // Application namespace can from from
            // 1. An resolved yaml file with root element called spec
            // 2. From the namespace filed on a spec
            const namespace =
                this.spec.namespace.spec ||
                this.spec.namespace

            this.spec.namespaceObject = this.manager.toNamespaceObject(namespace)

            const result = await this.manager.cluster.upsert(this.spec.namespaceObject)
            if (result.error)
                throw result.error
        }
        else
            this.spec.namespaceObject = this.applicationSpec.namespaceObject

        if (!this.spec.namespaceObject)
            throw new Error(`Unable to determine namespace for service ${this.serviceName}`)
    }
}