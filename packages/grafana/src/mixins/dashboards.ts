import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { Deployment } from '@c6o/kubeclient-resources/apps/v1'
import { baseProvisionerType } from '../index'
import * as yaml from 'js-yaml'

export const dashboardApiMixin = (base: baseProvisionerType) => class extends base {

    // maintained between begin and endConfig
    appNamespace
    appName
    runningDeployment: Deployment

    // dashboards to add/remove
    addConfigMaps = []
    removeConfigMaps = []

    // datasources to add/remove
    datasources = []
    removeDatasources = []

    apiConfigMapAppMetadata = (appNamespace: string, appName: string) => ({
        'system.codezero.io/app-name': appName,
        'system.codezero.io/app-namespace': appNamespace
    })

    apiDashboardConfigMap(dashboardName: string, dashboardSpec?: string) {
        const configMap: any = {
            kind: 'ConfigMap',
            metadata: {
                namespace: this.runningDeployment.metadata.namespace,
                name: `${this.appNamespace}-${this.appName}-${dashboardName}`,
                labels: {
                    'system.codezero.io/managed-by': 'grafana',
                    ...this.apiConfigMapAppMetadata(this.appNamespace, this.appName)
                }
            }
        }
        if (dashboardSpec) {
            configMap.data = {
                [dashboardName + '.json']: dashboardSpec
            }
        }
        return configMap
    }

    mainConfigMap(namespace) {
        return {
            kind: 'ConfigMap',
            metadata: {
                namespace,
                name: 'grafana-provider-dashboards'
            }
        }
    }

    /**
     * Clear configuration from all grafanas installed for specified
     * application and namespace
     *
     * @param appNamespace
     * @param appName
     */
    async clearConfig(namespace: string, appNamespace: string, appName: string) {

        let result = await this.controller.cluster.list({
            kind: 'ConfigMap',
            metadata: {
                namespace,
                labels: {
                    ...this.apiConfigMapAppMetadata(appNamespace, appName)
                }
            }
        })
        result.throwIfError()


        for(const cm of result.each<ConfigMap>('ConfigMap')) {
            result = await this.controller.cluster.delete(cm)
            result.throwIfError()
        }

        result = await this.getGrafanaDeployment(namespace)
        result.throwIfError()
        this.runningDeployment = result.as<Deployment>()

        await this.removeFoldersDataSources(namespace, appNamespace, appName)
        await this.removeVolumeMounts(appNamespace, appName)

        await this.restartGrafana()
        delete this.runningDeployment
    }

    /**
     * Remove all dashboards and data sources added by an app
     *
     * @param deploymentItem
     * @param appNamespace
     * @param appName
     */
    async removeFoldersDataSources(namespace: string, appNamespace, appName) {

        let result = await this.controller.cluster.read(this.mainConfigMap(namespace))
        result.throwIfError()
        const configMap = result.as<ConfigMap>()

        const ownerPrefix = `${appNamespace}-${appName}`
        const dbProviders: any = yaml.load(configMap.data['dashboardproviders.yaml'])
        dbProviders.providers = dbProviders.providers || []
        dbProviders.providers = dbProviders.providers.filter(entry => entry.folder !== ownerPrefix)

        const dbSources: any = yaml.load(configMap.data['datasources.yaml'])
        dbSources.datasources = dbSources.datasources || []
        dbSources.datasources = dbSources.datasources.filter(entry => !entry.name.startsWith(ownerPrefix))

        result = await this.controller.cluster.patch(configMap, {
            data: {
                'dashboardproviders.yaml': yaml.dump(dbProviders),
                'datasources.yaml': yaml.dump(dbSources)
            }
        })
        result.throwIfError()
    }

    /**
     * Remove all added volumes and mounts added by an app for dashboards
     * from a deployment and restart
     *
     * @param appNamespace owner app namespace
     * @param appName owner app name
     */
    async removeVolumeMounts(appNamespace, appName) {
        const volumeName = `dashboards-${appNamespace}-${appName}`

        let volumeArray = this.runningDeployment.spec.template.spec.volumes
        volumeArray = volumeArray.filter(vol => !vol.name.startsWith(volumeName))
        this.runningDeployment.spec.template.spec.volumes = volumeArray

        let volumeMountArray = this.runningDeployment.spec.template.spec.containers[0].volumeMounts
        volumeMountArray = volumeMountArray.filter(vol => !vol.name.startsWith(volumeName))
        this.runningDeployment.spec.template.spec.containers[0].volumeMounts = volumeMountArray

        this.runningDeployment.apiVersion = 'apps/v1'
        this.runningDeployment.kind = 'Deployment'

        const result = await this.controller.cluster.patch(this.runningDeployment, this.runningDeployment)
        result.throwIfError()
    }

    getGrafanaDeployment = async (namespace) => {
        const deployment = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace,
                name: 'grafana',
                labels: {
                    name: 'grafana'
                }
            }
        }
        return await this.controller.cluster.read(deployment)
    }

    /**
     * Start to configure Grafana
     *
     * @param {string} namespace Namespace where the grafana instance lives
     * @param {string} appNamespace namespace of client app adding/removing dashobard config
     * @param {string} appName name of client app changing config
     */
    async beginConfig(namespace: string, appNamespace: string, appName: string) {
        if (this.runningDeployment)
            throw Error('There is already a running dashboard transaction')

        const result = await this.getGrafanaDeployment(namespace)
        result.throwIfError()
        this.runningDeployment = result.as<Deployment>()

        // in case version changes
        // delete this.runningDeployment.metadata.resourceVersion
        // delete this.runningDeployment.metadata.uid

        this.appNamespace = appNamespace
        this.appName = appName
    }

    async updateConfig(): Promise<boolean> {
        let result = await this.controller.cluster.read(this.mainConfigMap(this.runningDeployment.metadata.namespace))
        result.throwIfError()
        const configMap = result.as<ConfigMap>()

        const folder = `${this.appNamespace}-${this.appName}`

        let modified = false

        // add dashboard provider folders if needed
        const dbProviders: any = yaml.load(configMap.data['dashboardproviders.yaml'])
        dbProviders.providers = dbProviders.providers || []
        const index = dbProviders.providers.findIndex(entry => entry.folder == folder)
        if (index === -1) {
            dbProviders.providers.push({
                folder,
                name: folder,
                disableDeletion: false,
                options: {
                    path: `/var/lib/grafana/dashboards/${folder}`
                },
                orgId: 1,
                type: 'file'
            })
            modified = true
        }

        // add and remove datasource
        const dbSources: any = yaml.load(configMap.data['datasources.yaml'])
        dbSources.datasources = dbSources.datasources || []

        for (const source of this.datasources) {
            const index = dbSources.datasources.findIndex(entry => entry.name === source.name)
            if (index === -1) {
                dbSources.datasources.push(source)
                modified = true
            }
        }

        for (const sourceName of this.removeDatasources) {
            const index = dbSources.datasources.findIndex(entry => entry.name === sourceName)
            if (index !== -1) {
                dbSources.datasources.splice(index, 1)
                modified = true
            }
        }

        if (modified) {
            result = await this.controller.cluster.patch(result.as<ConfigMap>(), {
                data: {
                    'dashboardproviders.yaml': yaml.dump(dbProviders),
                    'datasources.yaml': yaml.dump(dbSources)
                }
            })
            result.throwIfError()
        }

        return modified
    }

    async addDataSource(name, spec): Promise<string> {
        this.datasources = this.datasources || []
        spec.name = `${this.appNamespace}-${this.appName}-${name}`
        // TODO: validate spec
        this.datasources.push(spec)
        return spec.name
    }

    async removeDataSource(name: string) {
        this.removeDatasources = this.removeDatasources || []
        this.removeDatasources.push(`${this.appNamespace}-${this.appName}-${name}`)
    }

    async addDashboard(dashboardName: string, dashBoardSpec: string): Promise<void> {

        this.addConfigMaps.push(this.apiDashboardConfigMap(dashboardName, dashBoardSpec))

        const volumeName = `dashboards-${this.appNamespace}-${this.appName}-${dashboardName}`
        // patches to deployment
        const volume = {
            name: volumeName,
            configMap: {
                name: `${this.appNamespace}-${this.appName}-${dashboardName}`
            }
        }

        const volumeMount = {
            name: volumeName,
            mountPath: `/var/lib/grafana/dashboards/${this.appNamespace}-${this.appName}/${dashboardName}.json`,
            subPath: `${dashboardName}.json`,
            readOnly: true
        }

        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name == volumeName)
        if (index === -1)
            volumeArray.push(volume)

        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[0].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name == volumeName)
        if (index === -1)
            volumeMountArray.push(volumeMount)
    }

    async removeDashboard(dashboardName: string): Promise<void> {
        // remove the dashboard configmap
        this.removeConfigMaps.push(this.apiDashboardConfigMap(dashboardName))

        const volumeName = `dashboards-${this.appNamespace}-${this.appName}-${dashboardName}`

        // remove the dashboard volume and volume mount from the deployment
        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name == volumeName)
        if (index !== -1)
            volumeArray.splice(index, 1)

        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[0].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name == volumeName)
        if (index !== -1)
            volumeMountArray.splice(index, 1)
    }

    async endConfig() {
        let restart = false

        // Add all the config maps
        for (const configMap of this.addConfigMaps) {
            const result = await this.controller.cluster.upsert(configMap)
            if (result.error)
                throw result.error
            restart = true
        }

        // remove configmaps
        for (const configMap of this.removeConfigMaps) {
            const result = await this.controller.cluster.delete(configMap)
            if (result.error)   // don't throw if already gone
                if (result.error.code !== 404) throw result.error
            restart = true
        }

        if (await this.updateConfig()) {
            restart = true
        }

        // Add and remove volumes and mounts for maps
        if (restart) {
            const result = await this.controller.cluster.patch(this.runningDeployment, this.runningDeployment)
            result.throwIfError()
            await this.restartGrafana()
        }
        this.runningDeployment = null
    }

    async restartGrafana() {
        const previousCount = this.runningDeployment.spec?.replicas || 0
        await this.controller.cluster.patch(this.runningDeployment, { spec: { replicas: 0 } })
        await this.controller.cluster.patch(this.runningDeployment, { spec: { replicas: previousCount } })
    }
}