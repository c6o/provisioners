import { Cluster, PatchOps, Resource } from '@c6o/kubeclient-contracts'
import * as pointer from 'jsonpointer'
import createDebug from 'debug'

const debug = createDebug('provisioner:c6o-system:updateSystem:')

export const updateImageTag = async (cluster: Cluster, document: Resource, tag: string, path: string) => {
    const result = await cluster.list(document)

    if (result.error) {
        debug(`Failed to retrieve system ${document.kind}`, result.error)
        return
    }

    try {
        for (const docItem of result.object.items) {
            debug(`Updating ${document.kind}`, docItem.metadata.name)

            const currentImage = pointer.get(docItem, path)
            const sansTag = currentImage.substring(0, currentImage.indexOf(':'))
            const newImage = `${sansTag}:${tag}`

            debug(`Going from ${currentImage} to ${newImage}`)

            const op: PatchOps = [{ op: 'replace', path, value: newImage }]

            const patchResult = await cluster.patch({
                    apiVersion: document.apiVersion,
                    kind: document.kind,
                    ...docItem
                }, op)

            if (patchResult.error)
                throw patchResult.error
            else
                debug('Success')
        }
    }
    catch (ex) {
        debug('ERROR during update', ex)
        throw ex
    }
}