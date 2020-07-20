import { baseProvisionerMixinType } from '../'
import * as pointer from 'jsonpointer'
import createDebug from 'debug'

const debug = createDebug('provisioner:c6o-system:updateSystem:')

export const updateMixin = (base: baseProvisionerMixinType) => class extends base {

    updateImageTag = async (document, tag, path) => {
        const result = await this.manager.cluster.list(document)

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

                const op = [{ op: 'replace', path, value: newImage }]

                const patchResult = await this.manager.cluster.patch({
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
}