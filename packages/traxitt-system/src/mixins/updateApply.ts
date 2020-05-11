import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'
import { createDebug } from '@traxitt/common'
const debug = createDebug()

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {


    async updateNpm(serviceNamespace) {
        const npmLink = this.spec['npm-link']

        if (npmLink === unlinkToken) {
            this.manager.status?.push('Unlinking system from npm registry')
            await this.unlinkNpm(serviceNamespace)
            this.manager.status?.pop()
        }
        else if (npmLink) {
            this.manager.status?.push(`Linking system to npm at ${npmLink.name}`)
            await this.linkNpm(serviceNamespace)
            this.manager.status?.pop()
        }
    }


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
        await this.updateNpm(serviceNamespace)
        await this.updateLogger(serviceNamespace)
        await this.restartSystemServer(serviceNamespace)
    }

    async restartSystemServer(serviceNamespace) {
        const result = await this.getSystemServerDeployment(serviceNamespace)
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const deployment = result.object
                
        const previousCount = deployment.spec?.replicas
        await this.manager.cluster.patch(deployment, { spec: { replicas: 0 } })
        await this.manager.cluster.patch(deployment, { spec: { replicas: previousCount } })
    }
}