import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'
import createDebug from 'debug'

const debug = createDebug('traxitt-system:updateApply:')

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateNpm(serviceNamespace) {
        const newLink = this.spec['npm-link']

        if (newLink === unlinkToken) {
            this.manager.status?.push('Unlinking system from npm registry')
            await this.unlinkNpm(serviceNamespace)
            this.manager.status?.pop()

            return true
        }
        else if (newLink) {
            this.manager.status?.push(`Linking system to npm at ${newLink.name}`)
            await this.linkNpm(serviceNamespace)
            this.manager.status?.pop()

            return true
        }
    }

    async updateLogger(serviceNamespace) {
        const newLink = this.spec['logging-link']

        if (newLink === unlinkToken) {
            this.manager.status?.push('Unlinking system from logger')
            await this.unlinkLogger(serviceNamespace)
            this.manager.status?.pop()

            return true
        }
        else if (newLink) {
            const appNamespace = this.spec['logging-link'].split('/')[0]
            const appId = this.spec['logging-link'].split('/')[1]
            this.manager.status?.push(`Linking system to logger in namespace ${appNamespace} for app ${appId}`)
            await this.linkLogger(serviceNamespace, appNamespace, appId)
            this.manager.status?.pop()

            return true
        }
    }

    async updateGrafana(serviceNamespace) {
        const newLink = this.spec['grafana-link']

        if (newLink === unlinkToken) {
            this.manager.status?.push('Unlinking system from grafana')
            await this.unlinkGrafana(serviceNamespace)
            this.manager.status?.pop()

            return true
        }
        else if (newLink) {
            const appNamespace = this.spec['grafana-link']
            this.manager.status?.push(`Linking system to grafana in namespace ${appNamespace}`)
            await this.linkGrafana(appNamespace, serviceNamespace)
            this.manager.status?.pop()

            return true
        }
    }

    async updateApply() {
        const serviceNamespace = this.manager.document.metadata.namespace

        let restartRequired = await this.updateNpm(serviceNamespace)
        restartRequired = await this.updateLogger(serviceNamespace) || restartRequired
        restartRequired = await this.updateGrafana(serviceNamespace) || restartRequired
        restartRequired = await this.updateSystem(serviceNamespace) || restartRequired

        if (restartRequired)
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