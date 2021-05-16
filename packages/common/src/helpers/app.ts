import { Cluster } from '@c6o/kubeclient-contracts'
import { AppResource, AppHelper as AppHelperContract } from '@provisioner/contracts'

const APP_DOCUMENT = {
    apiVersion: 'system.codezero.io/v1',
    kind: 'App'
}

export class AppHelper<T extends AppResource = AppResource> extends AppHelperContract<T> {

    static template = (namespace?: string, name?: string): AppResource => ({
            apiVersion: 'system.codezero.io/v1',
            kind: 'App',
            metadata: {
                ...(name ? { name } : undefined),
                ...(namespace ? { namespace } : undefined)
            }
        })

    static from = (namespace?: string, name?: string) => {
        const template = AppHelper.template(namespace, name)
        return new AppHelper(template)
    }

    async read(cluster: Cluster, errorMessage?: string): Promise<AppResource> {
        const result = await cluster.read(this.resource)
        result.throwIfError(errorMessage)
        return result.as<AppResource>()
    }

    async list(cluster: Cluster, errorMessage?: string): Promise<AppResource[]> {
        const result = !this.name ?
            await cluster.list(this.resource) :
            await cluster.list(this.resource, {fieldSelector: `metadata.name=${this.name}` })
        result.throwIfError(errorMessage)
        return Array.from(result.each('App')) as AppResource[]
    }

    static async byInterface(cluster: Cluster, interfaceName: string, errorMessage?: string): Promise<Array<AppResource>> {
        const result = await cluster.list({
            ...APP_DOCUMENT,
            metadata: {
                labels: {
                    [`system.codezero.io/interface-${interfaceName}`]: 'true'
                }
            }
        })
        result.throwIfError(errorMessage)
        return Array.from(result.each<AppResource>('App'))
    }
}