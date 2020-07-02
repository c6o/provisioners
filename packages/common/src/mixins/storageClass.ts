import { baseProvisionerMixinType } from '../provisioner'

declare module '../provisioner' {
    export interface ProvisionerBase {
        inquireStorageClass(options) : Promise<any>
        getOnlyStorageClass() : Promise<string>
        storageClassName : string
    }
}

const STORAGE_CLASS_DOCUMENT = {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClass'
}

export const storageClassMixin = (base: baseProvisionerMixinType) => class storageClassImp extends base {
    storageClassChoices

    storageClassWhen = async (answers) => {
        const result = await this.manager.cluster.list(STORAGE_CLASS_DOCUMENT)
        if (result.object?.items?.length > 0) {
            this.storageClassChoices = result.object.items.map(sc => sc.metadata.name)
            return result.object?.items?.length > 1
        }
        return false
    }

    inquireStorageClass = (options) => ({
        message: 'What storage class would you like to use?',
        ...options,
        type: 'list',
        when: this.storageClassWhen,
        choices: () => this.storageClassChoices
    })

    getDefaultStorageClass = async() => {
        const result = await this.manager.cluster.list(STORAGE_CLASS_DOCUMENT)
        if (result?.object?.items?.length === 1)
            return result.object.items[0].metadata?.name

        return undefined
    }
}