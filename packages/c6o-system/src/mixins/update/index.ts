import { baseProvisionerType } from '../../'
import { unlinkToken } from '../../constants'
import createDebug from 'debug'

const debug = createDebug('provisioner:c6o-system:updateSystem:')

export const updateSystemMixin = (base: baseProvisionerType) => class extends base {

    async updateSystem(serviceNamespace: string) {
        if (this.spec.updateToTag) {
            await this.performUpdate(this.spec.updateToTag)
            // Write back the new updated tag and clear updateToTag
            this.manager.document.spec.provisioner.tag = this.spec.updateToTag
            this.manager.document.spec.provisioner.updateToTag = unlinkToken
        }
    }

    performUpdate = async (tag) => {

        // Update deployments
        await this.updateImageTag({
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
        await this.updateImageTag({
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