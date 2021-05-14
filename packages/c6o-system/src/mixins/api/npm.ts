import { ConfigMap, Secret } from '@c6o/kubeclient-resources/core/v1'
import { AppHelper } from '@provisioner/common'
import { baseProvisionerType } from '../../'
import createDebug from 'debug'

const debug = createDebug('c6o-system:npmApiMixin:')

declare module '../..' {
    export interface Provisioner {
        linkNpm(serviceNamespace: string): Promise<void>
        unlinkNpm(serviceNamespace: string): Promise<void>
    }
}

export const npmApiMixin = (base: baseProvisionerType) => class extends base {

    systemServerSecrets(serviceNamespace) {
        return {
            kind: 'Secret',
            metadata: {
                namespace: serviceNamespace,
                name: 'system-server-secrets'
            }
        }
    }

    async linkNpm(serviceNamespace: string) {
        const npmLink = this.spec['npm-link']

        // only keep name and password in the app
        this.controller.document.spec.provisioner['npm-link'] = npmLink.name ? { name: npmLink.name } : { url: npmLink.url }

        // Get the current setting
        let registryUrl
        if (npmLink.name) {
            const appIdParts = npmLink.name.split('/')
            const appNamespace = appIdParts[0]
            const appId = appIdParts[1]

            const app = await AppHelper.from(appNamespace, appId).read(this.controller.cluster, `Failed to find ${appId} in ${appNamespace}`)
            const npmRegistry = app.spec.services['npm-registry']

            if (!app.spec.services?.['npm-registry']) {
                debug(`Unable to find npm-registry service for app ${appNamespace}.${appId}`)
                this.logger?.warn(`Unable to find npm-registry service for App ${appNamespace}.${appId}`)
                return
            }

            registryUrl = `${npmRegistry.protocol}://${npmRegistry.service}.${appNamespace}${npmRegistry.port !== 80 ? `:${npmRegistry.port}`:''}`
        }
        else
            registryUrl = npmLink.url

        let result = await this.controller.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerConfigMap = result.as<ConfigMap>()

        systemServerConfigMap.data = { NPM_REGISTRY_URL: registryUrl }
        await this.controller.cluster.upsert(systemServerConfigMap)

        if (npmLink.username && npmLink.password) {
            result = await this.controller.cluster.read(this.systemServerSecrets(serviceNamespace))
            if (result.error) {
                debug(result.error)
                this.logger?.error(result.error)
                throw result.error
            }
            const systemServerSecrets = result.as<Secret>()

            // username and password already encoded
            systemServerSecrets.data = {
                ...systemServerSecrets.data,
                NPM_REGISTRY_USERNAME: npmLink.username,
                NPM_REGISTRY_PASSWORD: npmLink.password
            }
            await this.controller.cluster.upsert(systemServerSecrets)
        }

        await this.restartSystemServer(serviceNamespace)
    }

    async unlinkNpm(serviceNamespace) {
        let result = await this.controller.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerConfigMap = result.as<ConfigMap>()

        systemServerConfigMap.data.NPM_REGISTRY_URL = null

        await this.controller.cluster.upsert(systemServerConfigMap)

        result = await this.controller.cluster.read(this.systemServerSecrets(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerSecrets = result.as<Secret>()

        if (systemServerSecrets.data) {
            systemServerSecrets.data.NPM_REGISTRY_USERNAME = null
            systemServerSecrets.data.NPM_REGISTRY_PASSWORD = null
        }

        await this.controller.cluster.upsert(systemServerSecrets)
        await this.restartSystemServer(serviceNamespace)
    }
}