import { baseProvisionerType } from '../../'
import { createDebug } from '@traxitt/common'
const debug = createDebug()

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
        const apps = await this.manager.getInstalledApps(appId, appNamespace)
        if (apps.length !== 1) {
            debug(`Unable to find App ${appNamespace}.${appId}`)
            this.logger?.warn(`Unable to find App ${appNamespace}.${appId}`)
            return
        }

        if (!apps[0].spec.services?.logstash) {
            debug(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            this.logger?.warn(`Unable to find logstash services for App ${appNamespace}.${appId}`)
            return
        }
        const logstash = apps[0].spec.services.logstash

        let result = await this.manager.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }            
        const systemServerConfigMap = result.object
        systemServerConfigMap.data = {
            LOG_ELASTIC_CONNECTION: `${logstash.protocol}://${logstash.service}.${appNamespace}:${logstash.port}`,
            ...systemServerConfigMap.data
        }
        await this.manager.cluster.upsert(systemServerConfigMap)

        await this.restartSystemServer(serviceNamespace)
    }

    async unlinkLogger(serviceNamespace) {
        let result = await this.manager.cluster.read(this.systemServerConfigMap(serviceNamespace))
        if (result.error) {
            debug(result.error)
            this.logger?.error(result.error)
            throw result.error
        }
        const systemServerConfigMap = result.object
        systemServerConfigMap.data.LOG_ELASTIC_CONNECTION = null
        await this.manager.cluster.patch(systemServerConfigMap, { data: systemServerConfigMap.data })

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