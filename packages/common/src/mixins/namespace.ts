import { baseProvisionerMixinType } from '../provisioner'
import { toManagedNamespace } from '@provisioner/contracts'

declare module '../provisioner' {
    export interface ProvisionerBase {
        ensureServiceNamespacesExist() : Promise<void>
        applicationNamespace : string
        serviceNamespace: string
    }
}

export const namespaceMixin = (base: baseProvisionerMixinType) => class namespaceImp extends base {

    // TODO: Come up with a better way storing these
    // @ts-ignore
    get applicationNamespace() { return this.supervisor.namespace.metadata?.name }
    get serviceNamespace() { return this.spec?.namespaceObject?.metadata?.name }

    // for deprovisioning we don't have/want a namespaceObject
    get deprovisionNamespace() { return this.spec.namespace?.spec || this.spec.namespace || this.document?.metadata?.namespace }

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

            this.spec.namespaceObject = toManagedNamespace(namespace)

            const result = await this.cluster.upsert(this.spec.namespaceObject)
            result.throwIfError(`Failed to create namespace ${this.spec.namespaceObject.metadata?.name}`)
        }
        else
            //@ts-ignore
            this.spec.namespaceObject = this.supervisor.namespace

        if (!this.spec.namespaceObject)
            throw new Error(`Unable to determine namespace for service ${this.serviceName}`)
    }
}