import createDebug from 'debug'
import { updateImageTag } from '@provisioner/common'
import { unlinkToken } from '../../constants'
import { baseProvisionerType } from '../../'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = createDebug('provisioner:c6o-system:updateSystem:')

declare module '../..' {
    export interface Provisioner {
        updateSystem(): Promise<void>
        unlinkGrafana(serviceNamespace: string, clearLinkField?: boolean): Promise<void>
    }
}


export const updateSystemMixin = (base: baseProvisionerType) => class extends base {

    async updateSystem() {
        if (this.spec.updateToTag) {
            await this.performUpdate(this.spec.updateToTag)
            // Write back the new updated tag and clear updateToTag
            this.controller.resource.spec.provisioner.tag = this.spec.updateToTag
            this.controller.resource.spec.provisioner.updateToTag = unlinkToken
        }
    }

    performUpdate = async (tag) => {

        // Update deployments
        await updateImageTag(this.controller.cluster, {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace: 'c6o-system',
                labels: { role: 'system' }
            }
        },
            tag,
            '/spec/template/spec/containers/0/image'
        )

        // Update the cron jobs
        await updateImageTag(this.controller.cluster, {
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            metadata: {
                namespace: 'c6o-system',
                labels: { role: 'system' }
            }
        },
            tag,
            '/spec/jobTemplate/spec/template/spec/containers/0/image'
        )
    }
}