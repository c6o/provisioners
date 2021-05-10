import { Cluster, ResourceHelper } from '@c6o/kubeclient-contracts'
import { StorageClass } from '@c6o/kubeclient-resources/storage/v1'

const STORAGE_CLASS_DOCUMENT: Partial<StorageClass> = {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClass'
}

export type PartialStorageClass = Omit<StorageClass, 'provisioner'>

export class StorageClassHelper<T extends PartialStorageClass = PartialStorageClass> extends ResourceHelper<T> {

    static from(name?: string) {
        return new StorageClassHelper({
            apiVersion: 'storage.k8s.io/v1',
            kind: 'StorageClass',
            metadata: {
                name
            }
        })
    }

}

export const inquireStorageClass = (cluster: Cluster, options) => {
    let choices = []

    const storageClassWhen = async (answers) => {
        const result = await cluster.list(STORAGE_CLASS_DOCUMENT)
        const length = result.object?.items?.length
        if (length > 0) {
            choices = result.object.items.map(sc => sc.metadata.name)
            if (length > 1) return true // Let the user choose
            // We have only one choice - set it and don't prompt
            answers[options.name] = choices[0]
        }
        return false
    }

    return {
        message: 'What storage class would you like to use?',
        ...options,
        type: 'list',
        when: storageClassWhen,
        choices: () => choices
    }
}

export const getDefaultStorageClass = async(cluster: Cluster) => {
    const result = await cluster.list(STORAGE_CLASS_DOCUMENT)
    if (result?.object?.items?.length === 1)
        return result.object.items[0].metadata?.name
}
