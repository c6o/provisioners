import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { AppHelper } from '@provisioner/common'
import { baseProvisionerType } from '../../'
import createDebug from 'debug'

const debug = createDebug('c6o-system:logger:')

declare module '../..' {
    export interface Provisioner {
        systemServerConfigMap(serviceNamespace: string): ConfigMap
        linkLogger(serviceNamespace, appNamespace, appId): Promise<void>
        unlinkLogger(serviceNamespace): Promise<void>
    }
}

export const loggerApiMixin = (base: baseProvisionerType) => class extends base {

    systemServerConfigMap(serviceNamespace): ConfigMap {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace: serviceNamespace,
                name: 'system-server-config' // constants?
            }
        }
    }

    async linkLogger(serviceNamespace, appNamespace, appId) {
        const app = await AppHelper.from(appNamespace, appId).read(this.controller.cluster, `Failed to find ${appId} in ${appNamespace}`)

        if (!app.spec.services?.logstash) {
            debug(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            this.logger?.warn(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            return
        }
        const logstash = app.spec.services.logstash

        const result = await this.controller.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }

        const systemServerConfigMap = result.as<ConfigMap>()
        systemServerConfigMap.data = {
            LOG_ELASTIC_CONNECTION: `${logstash.protocol}://${logstash.service}.${appNamespace}:${logstash.port}`,
            LOG_LEVEL: 'info',
            ...systemServerConfigMap.data
        }
        await this.controller.cluster.upsert(systemServerConfigMap)

        await this.restartSystemServer(serviceNamespace)
    }

    async unlinkLogger(serviceNamespace) {
        const result = await this.controller.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerConfigMap = result.as<ConfigMap>()
        systemServerConfigMap.data.LOG_ELASTIC_CONNECTION = null
        await this.controller.cluster.patch(systemServerConfigMap, { data: systemServerConfigMap.data })

        await this.restartSystemServer(serviceNamespace)
    }


}