import { baseProvisionerType } from '../index'
import * as yaml from 'js-yaml'
import { asyncForEach } from '@traxitt/common'

export const dashboardApiMixin = (base: baseProvisionerType) => class extends base {

    dashboardFolder
    runningDeployment

    dashboardConfigMaps = []
    dashboardOps = []

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

        // Add the folder to the configMap if it doesn't already exist
        const doc = yaml.safeLoad(result.object.data['dashboardproviders.yaml'])
        doc.providers = doc.providers || []
        const index = doc.providers.findIndex(entry => entry.folder == folder)
        if (index == -1) {
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

    async addDashboard(dashboardName: string, dashBoardSpec: string): Promise<void> {

        this.dashboardConfigMaps.push({
            kind: 'ConfigMap',
            metadata: {
                namespace: this.runningDeployment.metadata.namespace,
                name: dashboardName,
                labels: {
                    'system.traxitt.com/managed-by':'grafana'
                }
            },
            data: {
                [dashboardName + '.json']: dashBoardSpec
            }
        })

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

        let index = this.runningDeployment.spec.template.spec.volumes.findIndex(vol => vol.name == volume.name)
        if (index == -1)
            this.dashboardOps.push({ 'op': 'add', 'path': '/spec/template/spec/volumes/-', 'value': volume })

        index = this.runningDeployment.spec.template.spec.containers[0].volumeMounts.findIndex(vol => vol.name == volumeMount.name)
        if (index == -1)
            this.dashboardOps.push({ 'op': 'add', 'path': '/spec/template/spec/containers/0/volumeMounts/-', 'value': volumeMount })
    }

    async endDashboard() {
        let restart = false

        // Add all the config maps
        await asyncForEach(this.dashboardConfigMaps, async (configMap) => {
            const result = await this.manager.cluster.upsert(configMap)
            if (result.error)
                throw result.error
        })

        // Apply the ops
        if (this.dashboardOps.length) {
            const result = await this.manager.cluster.patch(this.runningDeployment, this.dashboardOps)
            if (result.error)
                throw result.error

            restart = true
        }

        if (restart)
            await this.restartGrafana()
    }

    async restartGrafana() {
        const previousCount = this.runningDeployment.spec?.replicas || 0
        await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: 0 } })
        await this.manager.cluster.patch(this.runningDeployment, { spec: { replicas: previousCount } })
    }
}