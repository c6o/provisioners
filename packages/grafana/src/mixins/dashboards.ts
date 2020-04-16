import { baseProvisionerType } from '../index'
import * as yaml from 'js-yaml'

export const dashboardApiMixin = (base: baseProvisionerType) => class extends base {

    dashboardFolder
    runningDeployment

    // dashboards to add
    addConfigMaps = []
    // to remove
    removeConfigMaps = []

    /**
     * Start to add dashboards to Grafana
     *
     * @param {string} namespace Namespace where the grafana instance lives
     * @param {string} folder Folder to mount new dashboards
     */
    async beginDashboard(namespace: string, folder: string) {
        if (this.runningDeployment)
            throw Error('There is already a running dashboard transaction')

        let result = await this.manager.cluster.read({
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace,
                name: 'grafana'
            }
        })

        if (result.error)
            throw result.error
        this.runningDeployment = result.object

        result = await this.manager.cluster.read({
            kind: 'ConfigMap',
            metadata: {
                namespace,
                name: 'grafana-provider-dashboards'
            }
        })

        if (result.error)
            throw result.error

        // Add the app folder to the configMap if it doesn't already exist
        // TODO: we leave this folder in place even when dashboards are removed
        const doc = yaml.safeLoad(result.object.data['dashboardproviders.yaml'])
        doc.providers = doc.providers || []
        const index = doc.providers.findIndex(entry => entry.folder == folder)
        if (index === -1) {
            doc.providers.push({
                folder,
                name: folder,
                disableDeletion: false,
                options: {
                    path: `/var/lib/grafana/dashboards/${folder}`
                },
                orgId: 1,
                type: 'file'
            })

            result = await this.manager.cluster.patch(result.object, {
                data: {
                    'dashboardproviders.yaml': yaml.safeDump(doc)
                }
            })

            if (result.error)
                throw result.error
        }

        this.dashboardFolder = folder
    }

    apiDashboardConfigMap(dashboardName: string, dashboardSpec?: string) {
        const configMap: any = {
            kind: 'ConfigMap',
            metadata: {
                namespace: this.runningDeployment.metadata.namespace,
                name: dashboardName,
                labels: {
                    'system.traxitt.com/managed-by':'grafana'
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

    async addDashboard(dashboardName: string, dashBoardSpec: string): Promise<void> {

        this.addConfigMaps.push(this.apiDashboardConfigMap(dashboardName, dashBoardSpec))

        // patches to deployment
        const volume = {
            name: `dashboards-${dashboardName}`,
            configMap: {
                name: dashboardName
            }
        }

        const volumeMount = {
            name: `dashboards-${dashboardName}`,
            mountPath: `/var/lib/grafana/dashboards/${this.dashboardFolder}/${dashboardName}.json`,
            subPath: `${dashboardName}.json`,
            readOnly: true
        }

        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name == volume.name)
        if (index === -1)
            volumeArray.push(volume)

        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[0].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name == volumeMount.name)
        if (index === -1)
            volumeMountArray.push(volumeMount)
    }

    async removeDashboard(dashboardName: string): Promise<void> {
        // remove the dashboard configmap
        this.removeConfigMaps.push(this.apiDashboardConfigMap(dashboardName))

        const volumeName = `dashboards-${dashboardName}`

        // remove the dashboard volume and volume mount from the deployment
        const volumeArray = this.runningDeployment.spec.template.spec.volumes
        let index = volumeArray.findIndex(vol => vol.name == volumeName)
        if (index !== -1)
            volumeArray.splice(index,1)
        
        const volumeMountArray = this.runningDeployment.spec.template.spec.containers[0].volumeMounts
        index = volumeMountArray.findIndex(vol => vol.name == volumeName)
        if (index !== -1)
            volumeMountArray.splice(index,1)
    }

    async endDashboard() {
        let restart = false

        // Add all the config maps
        for (const configMap of this.addConfigMaps) {
            const result = await this.manager.cluster.upsert(configMap)
            if (result.error)
                throw result.error
            restart = true
        }

        // remove configmaps
        for (const configMap of this.removeConfigMaps) {
            const result = await this.manager.cluster.delete(configMap)
            if (result.error)
                throw result.error
            restart = true
        }

        // Apply the ops (adding and removing volumes and mounts for maps)
        if (restart) {
            const result = await this.manager.cluster.upsert(this.runningDeployment)
            if (result.error)
                throw result.error
            await this.restartGrafana()
        }
    }

    async restartGrafana() {
        const previousCount = this.runningDeployment.spec?.replicas || 0
        await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: 0 } })
        await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: previousCount } })
    }
}