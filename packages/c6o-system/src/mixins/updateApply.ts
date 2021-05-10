import { Deployment } from '@c6o/kubeclient-resources/apps/v1'
import { DeploymentHelper } from '@provisioner/common'
import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'
import createDebug from 'debug'

const debug = createDebug('c6o-system:updateApply:')

declare module '../' {
    export interface Provisioner {
        restartSystemServer(serviceNamespace: string): Promise<Deployment>
    }
}
export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    restartSystemServer = async (serviceNamespace) =>
        await DeploymentHelper.from(serviceNamespace, 'system-server').restartDeployment(super.cluster)


    async updateNpm(serviceNamespace) {
        const newLink = this.spec['npm-link']

        if (newLink === unlinkToken) {
            super.status?.push('Unlinking system from npm registry')
            await this.unlinkNpm(serviceNamespace)
            super.status?.pop()

            return true
        }
        else if (newLink) {
            super.status?.push(`Linking system to npm at ${newLink.name}`)
            await this.linkNpm(serviceNamespace)
            super.status?.pop()

            return true
        }
    }

    async updateLogger(serviceNamespace) {
        const newLink = this.spec['logging-link']

        if (newLink === unlinkToken) {
            super.status?.push('Unlinking system from logger')
            await this.unlinkLogger(serviceNamespace)
            super.status?.pop()

            return true
        }
        else if (newLink) {
            const appNamespace = this.spec['logging-link'].split('/')[0]
            const appId = this.spec['logging-link'].split('/')[1]
            super.status?.push(`Linking system to logger in namespace ${appNamespace} for app ${appId}`)
            await this.linkLogger(serviceNamespace, appNamespace, appId)
            super.status?.pop()

            return true
        }
    }

    async updateGrafana(serviceNamespace) {
        const newLink = this.spec['grafana-link']

        if (newLink === unlinkToken) {
            super.status?.push('Unlinking system from grafana')
            await this.unlinkGrafana(serviceNamespace)
            super.status?.pop()

            return true
        }
        else if (newLink) {
            const appNamespace = this.spec['grafana-link']
            super.status?.push(`Linking system to grafana in namespace ${appNamespace}`)
            await this.linkGrafana(appNamespace, serviceNamespace)
            super.status?.pop()

            return true
        }
    }

    async updateApply() {
        const serviceNamespace = super.document.metadata.namespace

        let restartRequired = await this.updateNpm(serviceNamespace)
        restartRequired = await this.updateLogger(serviceNamespace) || restartRequired
        restartRequired = await this.updateGrafana(serviceNamespace) || restartRequired
        await this.updateSystem()

        if (restartRequired)
            await this.restartSystemServer(serviceNamespace)
    }

}