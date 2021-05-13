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
                name,
                namespace
            }
        })

    static from = (namespace?: string, name?: string) =>
        new AppHelper(AppHelper.template(namespace, name))

    async read(cluster: Cluster, errorMessage?: string): Promise<AppResource> {
        const result = await cluster.read(this.document)
        result.throwIfError(errorMessage)
        return result.as<AppResource>()
    }

    async list(cluster, errorMessage?: string) {
        const result = !this.name ?
            await cluster.list(this.document) :
            await cluster.list(this.document, {fieldSelector: `metadata.name=${this.name}` })
        result.throwIfError(errorMessage)
        return Array.from(this.each('App'))
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
/*
1. Get a field from the document
document.spec.volmes[0].container.image

2. field mutator
document.spec.volmes[0].container.image = foo

3. Cluster interaction
name, namespace => document

4. Label/Annotation mutations/getters
document - setType = environment => metadata.label['codezero.io/system/type']  = environment

5. Cluster Finder based on label/annotation

const doc = await Deployment
    .from(name, namespace) <- helper
    .isManagedBy('codezero)
    .read(cluster)

const doc = Deployment.from(name, namespace)
    Deployment.isManagedBy(doc, 'codezero)
    Deployment.read(cluster, doc)


await Deployment
    .update(cluster, doc)
*/