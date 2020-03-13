import { baseProvisionerType } from '../../'

export const grafanaMixin = (base: baseProvisionerType) => class extends base {
    grafanaNamespace
    grafanaProvisioner

    'grafana-link' = {
        find: async () => {
            const result = await this.findGrafanaLinkConfigMap()
            if (result.error) {
                // We aren't linked
                const apps = await super.getInstalledApp('grafana')
                const choices = apps.map(app => app.metadata.namespace) || []
                return { choices }
            }

            // We are linked
            return result.object.data
        },

        create: async (data) => {
            this.grafanaNamespace = data.namespace
            if (this.grafanaNamespace) {
                const result = await this.linkGrafana()
                return result.object || result.error
            }
            return new Error('Namespace is required')
        },

        remove: async (namespace) => {
            return await this.unlinkGrafana()
        }
    }

    grafanaLinkConfigMap = {
        kind: 'ConfigMap',
        metadata: {
            name: 'istio-grafana-link',
            namespace: 'istio-system'
        }
    }

    async addGrafanaLinkConfigMap() {
        return await this.manager.cluster.create({
            ...this.grafanaLinkConfigMap,
            data: {
                'grafana-namespace': this.grafanaNamespace
            }
        })
    }

    async findGrafanaLinkConfigMap() {
        return await this.manager.cluster.read(this.grafanaLinkConfigMap)
    }

    async removeGrafanaLinkConfigMap() {
        return await this.manager.cluster.delete(this.grafanaLinkConfigMap)
    }

    async linkGrafana() {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')

        await this.grafanaProvisioner.beginDashboard(this.grafanaNamespace, 'istio')

        await this.addDashboard('citadel-dashboard')
        await this.addDashboard('galley-dashboard')
        await this.addDashboard('istio-mesh-dashboard')

        await this.grafanaProvisioner.endDashboard()
        return await this.addGrafanaLinkConfigMap()
    }

    async unlinkGrafana() {
        return await this.removeGrafanaLinkConfigMap()
    }

    // TODO: Get the istio-system namespace from getInstalledApp

    async addDashboard(name) {
        const data = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        await this.grafanaProvisioner.addDashboard(name, data)
    }
}