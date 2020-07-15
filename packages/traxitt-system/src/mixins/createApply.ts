import { baseProvisionerType } from '../'

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
    }

    gatewayServers = [{
        port: {
            name: 'http-istio-gateway',
            number: 80,
            protocol: 'HTTP'
        },
        hosts: ['*']
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
            name: 'traxitt-system'
        }
    }

    traxittNamespacePatch = {
        metadata: {
            annotations: {
                'system.traxitt.com/display': 'System',
                'system.traxitt.com/icon': '<svg id="solar_x5F_system" enable-background="new 0 0 300 300" height="512" viewBox="0 0 300 300" width="512" xmlns="http://www.w3.org/2000/svg">    <circle cx="120.404" cy="125" fill="#edebdc" r="90" />    <g fill="#4c241d">        <path d="m247.318 260.109c-1.023 0-2.047-.391-2.828-1.172-1.562-1.562-1.562-4.094 0-5.656l14.172-14.176c1.562-1.562 4.094-1.562 5.656 0s1.562 4.094 0 5.656l-14.172 14.176c-.781.782-1.804 1.172-2.828 1.172z" />        <path d="m261.49 260.109c-1.023 0-2.047-.391-2.828-1.172l-14.172-14.176c-1.562-1.562-1.562-4.094 0-5.656s4.094-1.562 5.656 0l14.172 14.176c1.562 1.562 1.562 4.094 0 5.656-.781.782-1.804 1.172-2.828 1.172z" />        <path d="m39.318 60.109c-1.023 0-2.047-.391-2.828-1.172-1.562-1.562-1.562-4.094 0-5.656l14.172-14.176c1.562-1.562 4.094-1.562 5.656 0s1.562 4.094 0 5.656l-14.172 14.177c-.781.781-1.804 1.171-2.828 1.171z" />        <path d="m53.49 60.109c-1.023 0-2.047-.391-2.828-1.172l-14.172-14.175c-1.562-1.562-1.562-4.094 0-5.656s4.094-1.562 5.656 0l14.172 14.176c1.562 1.562 1.562 4.094 0 5.656-.781.781-1.804 1.171-2.828 1.171z" />        <circle cx="242.404" cy="115" r="4" />        <circle cx="254.404" cy="51" r="4" />        <circle cx="38.404" cy="263" r="4" />        <circle cx="210.404" cy="183" r="4" />        <circle cx="138.404" cy="91" r="4" />        <circle cx="42.404" cy="227" r="4" />        <circle cx="90.404" cy="43" r="4" />        <circle cx="38.404" cy="95" r="4" />        <path d="m155 267c-63.188 0-114.596-51.41-114.596-114.598s51.408-114.593 114.596-114.593 114.596 51.406 114.596 114.594-51.408 114.597-114.596 114.597zm0-221.191c-58.777 0-106.596 47.816-106.596 106.594s47.819 106.597 106.596 106.597 106.596-47.82 106.596-106.598-47.819-106.593-106.596-106.593z" />        <path d="m155 235.957c-46.07 0-83.553-37.484-83.553-83.555s37.483-83.55 83.553-83.55 83.553 37.48 83.553 83.551-37.483 83.554-83.553 83.554zm0-159.105c-41.66 0-75.553 33.891-75.553 75.551s33.893 75.554 75.553 75.554 75.553-33.895 75.553-75.555-33.893-75.55-75.553-75.55z" />    </g>    <circle cx="155" cy="152.404" fill="#ffce56" r="46.998" />    <path d="m155 203.402c-28.121 0-50.998-22.879-50.998-51s22.877-50.996 50.998-50.996 50.998 22.875 50.998 50.996-22.877 51-50.998 51zm0-93.996c-23.709 0-42.998 19.289-42.998 42.996 0 23.711 19.289 43 42.998 43s42.998-19.289 42.998-43c0-23.707-19.289-42.996-42.998-42.996z" fill="#4c241d" />    <circle cx="210.298" cy="246.17" fill="#e66353" r="16.83" />    <path d="m210.299 267c-11.486 0-20.83-9.344-20.83-20.828 0-11.488 9.344-20.832 20.83-20.832 11.484 0 20.828 9.344 20.828 20.832 0 11.484-9.344 20.828-20.828 20.828zm0-33.66c-7.074 0-12.83 5.758-12.83 12.832s5.756 12.828 12.83 12.828 12.828-5.754 12.828-12.828-5.754-12.832-12.828-12.832z" fill="#4c241d" />    <circle cx="85.277" cy="116.34" fill="#bf7e68" r="16.83" />    <path d="m85.277 137.172c-11.486 0-20.83-9.344-20.83-20.832 0-11.484 9.344-20.828 20.83-20.828 11.484 0 20.828 9.344 20.828 20.828 0 11.488-9.343 20.832-20.828 20.832zm0-33.66c-7.074 0-12.83 5.754-12.83 12.828s5.756 12.832 12.83 12.832 12.828-5.758 12.828-12.832-5.753-12.828-12.828-12.828z" fill="#4c241d" />    <circle cx="205.489" cy="53.83" fill="#9dc1e4" r="16.83" />    <path d="m205.49 74.66c-11.486 0-20.83-9.344-20.83-20.832 0-11.484 9.344-20.828 20.83-20.828 11.484 0 20.828 9.344 20.828 20.828 0 11.488-9.343 20.832-20.828 20.832zm0-33.66c-7.074 0-12.83 5.754-12.83 12.828s5.756 12.832 12.83 12.832 12.828-5.758 12.828-12.832-5.754-12.828-12.828-12.828z" fill="#4c241d" />    <path d="m198.404 155h-20c-2.209 0-4-1.789-4-4s1.791-4 4-4h20c2.209 0 4 1.789 4 4s-1.791 4-4 4z" fill="#4c241d" />    <path d="m130.402 179h-15.998c-2.209 0-4-1.789-4-4s1.791-4 4-4h15.998c2.209 0 4 1.789 4 4s-1.791 4-4 4z" fill="#4c241d" />    <path d="m162.404 139h-48c-2.209 0-4-1.789-4-4s1.791-4 4-4h48c2.209 0 4 1.789 4 4s-1.791 4-4 4z" fill="#4c241d" /></svg>'
            }
        }
    }

    get host() {
        const {
            clusterNamespace,
            accountName,
            clusterDomain
        } = this.spec
        return `${clusterNamespace}.${accountName}.${clusterDomain}`
    }

    get systemServerUrl() {
        return `${this.spec.protocol}://${this.host}`
    }

    async provisionSystem() {
        const options = {
            tag: this.spec.tag,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl,
            host: this.host
        }

        await this.manager.cluster
            .begin(`Provision system server`)
                .upsertFile('../../k8s/clusterrole.yaml')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/server.yaml', options)
                .patch(this.traxittNamespace, this.traxittNamespacePatch)
            .end()
    }

    async provisionOAuth() {
        await this.manager.cluster
            .begin('Provision CodeZero OAuth')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/oauth.yaml')
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
            accountName: this.spec.accountName,
            clusterDomain: this.spec.clusterDomain,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl
        }

        await this.manager.cluster
            .begin(`Provision Apps`)
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/marina.yaml', options)
                .upsertFile('../../k8s/store.yaml', options)
                .upsertFile('../../k8s/navstation.yaml', options)
                .upsertFile('../../k8s/apps.yaml', options)
                .clearOwners()
                .upsertFile('../../k8s/istio.yaml', options)
                .eachFile(async (appDoc) => {
                    // The apps above are not going through the provisioner
                    // TODO: Remove this hack - have them be properly provisioned
                    // at some point perhaps
                    await this.createAppPost(appDoc)
                }, '../../k8s/apps.yaml', options)
            .end()
    }


    async provisionGateway() {
        await this.manager.status?.push('Provision system gateway')

        const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
        const result = await istioProvisioner.createGateway('traxitt-system', this.SYSTEM_GATEWAY_NAME, this.gatewayServers)
        if (result.error) throw result.error

        await this.manager.status?.pop()
    }

    async provisionRoutes() {
        const clusterDomain = this.spec.clusterDomain.replace(".", "\\.")

        await this.manager.cluster
            .begin(`Provision messaging sub-system`)
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/virtualServices.yaml', { clusterDomain } )
            .end()
    }

    async provisionMessaging() {
        await this.manager.cluster
            .begin(`Provision messaging sub-system`)
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
            .begin(`Provision certificate cron job`)
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
            .begin(`Provision update cron job`)
                .upsertFile('../../k8s/update-recurring-job.yaml', options)
            .end()
    }
}
