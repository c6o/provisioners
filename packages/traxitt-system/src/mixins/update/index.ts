import { baseProvisionerType } from '../../'
import { unlinkToken } from '../../constants'
import * as pointer from 'jsonpointer'
import createDebug from 'debug'

const debug = createDebug('provisioner:traxitt-system:updateSystem:')

export const updateSystemMixin = (base: baseProvisionerType) => class extends base {

    async updateSystem(serviceNamespace: string) {
        if (this.spec.updateToTag) {
            await this.performUpdate(this.spec.updateToTag)
            this.spec.updateToTag = unlinkToken
            this.spec.tag = this.spec.updateToTag
        }
    }

    performUpdate = async (tag) => {

        // Update deployments
        await this.performTypeUpdate(tag, {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace: 'traxitt-system',
                labels: { role: 'system' }
            }
        },
        '/spec/template/spec/containers/0/image')

        // Update the cron jobs
        await this.performTypeUpdate(tag, {
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            metadata: {
                namespace: 'traxitt-system',
                labels: { role: 'system' }
            }
        },
        '/spec/jobTemplate/spec/template/spec/containers/0/image')
    }
    
    performTypeUpdate = async (tag, document, path) => {
        // Fetch all the system deployments
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
                    debug('ERROR during update', patchResult.error)
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