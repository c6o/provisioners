import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'
import { createDebug } from '@traxitt/common'
const debug = createDebug()

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateLogger(serviceNamespace) {
        const newLoggerLink = this.spec['logging-link']

        if (newLoggerLink === unlinkToken) {
            this.manager.status?.push('Unlinking system from logger')
            await this.unlinkLogger(serviceNamespace)
            this.manager.status?.pop()
        }
        else if (newLoggerLink) {
            const appNamespace = this.spec['logging-link'].split('/')[0]
            const appId = this.spec['logging-link'].split('/')[1]
            this.manager.status?.push(`Linking system to logger in namespace ${appNamespace} for app ${appId}`)
            await this.linkLogger(serviceNamespace, appNamespace, appId)
            this.manager.status?.pop()
        }
    }

    async updateApply() {
        const serviceNamespace = this.manager.document.metadata.namespace

        await this.updateLogger(serviceNamespace)
    }
}