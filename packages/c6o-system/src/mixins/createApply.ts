import { baseProvisionerType } from '../'
import { c6oNamespacePatch } from './systemPatch'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    externalIPAddress
    SYSTEM_GATEWAY_NAME = 'system-gateway'

    async createApply() {
        this.spec.tag = this.spec.tag || 'canary'

        await this.ensureServiceNamespacesExist()
        await this.provisionSystem()
        await this.provisionApps()
        await this.provisionOAuth()
        await this.provisionDock()
        await this.provisionGateway()
        await this.provisionRoutes()
        await this.provisionCertificate()
        await this.provisionUpdate()
        await this.patchCluster()
    }

    gatewayServers = [{
        port: {
            name: 'http-istio-gateway',
            number: 80,
            protocol: 'HTTP'
        },
        hosts: ['*'],
        tls: {
            httpsRedirect: true
        }
    },
    {
        port: {
            name: 'https-istio-gateway',
            number: 443,
            protocol: 'HTTPS'
        },
        hosts: ['*'],
        tls: {
            mode: 'SIMPLE',
            credentialName: 'cluster-certificate-tls'
        }
    }]

    traxittNamespace = {
        kind: 'Namespace',
        metadata: {
            name: 'c6o-system'
        }
    }

    get host() {
        const {
            clusterNamespace,
            accountName,
            clusterDomain
        } = this.spec

        return accountName ?
            `${clusterNamespace}.${accountName}.${clusterDomain}` :
            `${clusterNamespace}.${clusterDomain}`
    }

    get systemServerUrl() {
        return `${this.spec.protocol}://${this.host}`
    }

    get systemServerCookieDomain() {
        return `.${this.host}`
    }

    async provisionSystem() {
        const options = {
            tag: this.spec.tag,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl,
            host: this.host,
            jwtKey: this.spec.clusterKey
        }

        await this.manager.cluster
            .begin('Provision system server')
                .upsertFile('../../k8s/clusterrole.yaml')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/server.yaml', options)
                .patch(this.traxittNamespace, c6oNamespacePatch)
                .upsertFile('../../k8s/ns-default.yaml')
            .end()
    }

    async provisionOAuth() {
        await this.manager.cluster
            .begin('Provision CodeZero OAuth')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/oauth.yaml', { hubServerURL: this.spec.hubServerURL })
            .end()
    }

    async provisionDock() {
        await this.manager.cluster
            .begin('Provision default Dock')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/dock.yaml')
            .end()
    }

    async provisionApps() {
        const options = {
            tag: this.spec.tag,
            clusterNamespace: this.spec.clusterNamespace,
            clusterDomain: this.spec.clusterDomain,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl,
            systemServerCookieDomain: this.systemServerCookieDomain,
            featureAuthKey: this.spec.featureAuthKey,
            stripePublishableKey: this.spec.stripePublishableKey,
        }

        await this.manager.cluster
            .begin('Provision Apps')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/marina.yaml', options)
                .upsertFile('../../k8s/store.yaml', options)
                .upsertFile('../../k8s/harbourmaster.yaml', options)
                .upsertFile('../../k8s/lifeboat.yaml', options)
                .upsertFile('../../k8s/navstation.yaml', options)
                .upsertFile('../../k8s/apps.yaml', options)
                .clearOwners()
                .upsertFile('../../k8s/istio.yaml', options)
                .eachFile(async (appDoc) => {
                    // The apps above are not going through the provisioner
                    // TODO: Remove this hack - have them be properly provisioned
                    // at some point perhaps
                    await this.postCreateApp(appDoc)
                }, '../../k8s/apps.yaml', options)
            .end()
    }


    async provisionGateway() {
        await this.manager.status?.push('Provision system gateway')

        const istioProvisioner = await this.getIstioProvisioner()
        const result = await istioProvisioner.createGateway('c6o-system', this.SYSTEM_GATEWAY_NAME, this.gatewayServers)
        result.throwIfError()

        await this.manager.status?.pop()
    }

    async provisionRoutes() {
        const host = this.host.split(".").join("\\.")

        await this.manager.cluster
            .begin('Provision messaging sub-system')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/virtualServices.yaml', { host } )
            .end()
    }

    async provisionMessaging() {
        await this.manager.cluster
            .begin('Provision messaging sub-system')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/publisher.yaml', { tag: this.spec.tag })
                .upsertFile('../../k8s/subscriber.yaml', { tag: this.spec.tag })
            .end()
    }

    async provisionCertificate() {
        // weekly but random minute and hour on Mondays to ensure not to overload hub server
        const schedule = process.env.NODE_ENV === 'development'
            ? '*/5 * * * *' // every 5 minutes on the 5
            : `${Math.floor(Math.random() * 59)} ${Math.floor(Math.random() * 23)} * * 1`

        const options = {
            tag: this.spec.tag,
            accountName: this.spec.accountName,
            hubServerURL: this.spec.hubServerURL,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            backoffLimit: 5,
            schedule
        }

        await this.manager.cluster
            .begin('Remove possible existing certificate cron jobs to avoid mutations')
                .deleteFile('../../k8s/ssl-recurring-job.yaml', options)
                .deleteFile('../../k8s/ssl-setup-job.yaml', options)
            .end()

        await this.manager.cluster
            .begin('Provision certificate cron jobs')
                .upsertFile('../../k8s/ssl-recurring-job.yaml', options)
                .upsertFile('../../k8s/ssl-setup-job.yaml', options)
            .end()
    }

    async provisionUpdate() {
        // weekly but random minute and hour on Mondays to ensure not to overload hub server
        const schedule = `${Math.floor(Math.random() * 59)} ${Math.floor(Math.random() * 23)} * * 1`

        const options = {
            tag: this.spec.tag,
            hubServerURL: this.spec.hubServerURL,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            backoffLimit: 5,
            schedule
        }

        await this.manager.cluster
            .begin('Provision update cron job')
                .upsertFile('../../k8s/update-recurring-job.yaml', options)
            .end()
    }

    async patchCluster() {
        if (!this.newClusterId)
            return
        await this.manager.hubClient.patchCluster(this.newClusterId, { $set: { 'system.status': 'completed' } })
    }
}
