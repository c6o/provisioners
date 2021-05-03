import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { baseProvisionerType } from '../../'
import createDebug from 'debug'

const debug = createDebug('c6o-system:logger:')

export const loggerApiMixin = (base: baseProvisionerType) => class extends base {

    systemServerConfigMap(serviceNamespace) {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace: serviceNamespace,
                name: 'system-server-config' // constants?
            }
        }
    }

    getSystemServerDeployment = async (serviceNamespace) => {
        const deployment = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace: serviceNamespace,
                name: 'system-server', // constants?
                labels: {
                    app: 'server',
                    role: 'system'
                }
            }
        }
        return await this.manager.cluster.read(deployment)
    }

    async linkLogger(serviceNamespace, appNamespace, appId) {
        const app = await this.manager.getInstalledApp(appId, appNamespace)

        if (!app.spec.services?.logstash) {
            debug(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            this.logger?.warn(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            return
        }
        const logstash = app.spec.services.logstash

        const result = await this.manager.cluster.read(this.systemServerConfigMap(serviceNamespace))
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
        await this.manager.cluster.upsert(systemServerConfigMap)

        await this.restartSystemServer(serviceNamespace)
    }

    async unlinkLogger(serviceNamespace) {
        const result = await this.manager.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerConfigMap = result.as<ConfigMap>()
        systemServerConfigMap.data.LOG_ELASTIC_CONNECTION = null
        await this.manager.cluster.patch(systemServerConfigMap, { data: systemServerConfigMap.data })

        await this.restartSystemServer(serviceNamespace)
    }


}