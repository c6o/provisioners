import { baseProvisionerType } from '../../'

export const grafanaMixin = (base: baseProvisionerType) => class extends base {
    appNamespace
    grafanaProvisioner

    'grafana-link' = {
        find: async () => {
            const namespace = await this.getAppLink('grafana')
            if (!namespace) {
                // We aren't linked
                const apps = await this.manager.getInstalledApps('grafana')
                const choices = apps.map(app => app.metadata.namespace) || []
                return { choices }
            }

            // We are linked
            return { namespace }
        },

        create: async (data) => {
            const namespace = await this.getAppLink('grafana')
            if (namespace)
                return

            if (!data.namespace)
                return new Error('Namespace is required')

            this.istioNamespace = data.istioNamespace
            this.appNamespace = data.namespace

            const result = await this.createTask(data.istioNamespace, 'link-grafana', {namespace: data.namespace})
            return result.object || result.error
        },

        remove: async () => {
            // TODO: namespace where we store our config map
            const namespace = await this.getAppLink('grafana')
            if (!namespace)
                throw Error('Grafana is not linked. Please link it first.')

            const result = await this.createTask('istio-system', 'unlink-grafana', { namespace })
            return result.object || result.error
            // return await this.unlinkGrafana()
        }
    }

    async linkGrafana() {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')

        await this.grafanaProvisioner.beginDashboard(this.taskSpec.spec.namespace, 'istio')

        await this.addDashboard('citadel-dashboard')

        // use prometheus plugin
        await this.addDashboard('galley-dashboard')
        await this.addDashboard('istio-mesh-dashboard')
        await this.addDashboard('istio-performance-dashboard')
        await this.addDashboard('istio-service-dashboard')
        await this.addDashboard('istio-workload-dashboard')
        await this.addDashboard('mixer-dashboard')
        await this.addDashboard('pilot-dashboard')

        await this.grafanaProvisioner.endDashboard()
        return await this.setAppLink('grafana', this.taskSpec.spec.namespace)
    }

    async unlinkGrafana() {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')
        await this.grafanaProvisioner.beginDashboard(this.taskSpec.spec.namespace, 'istio')

        await this.grafanaProvisioner.removeDashboard('citadel-dashboard')

        await this.grafanaProvisioner.removeDashboard('galley-dashboard')
        await this.grafanaProvisioner.removeDashboard('istio-mesh-dashboard')
        await this.grafanaProvisioner.removeDashboard('istio-performance-dashboard')
        await this.grafanaProvisioner.removeDashboard('istio-service-dashboard')
        await this.grafanaProvisioner.removeDashboard('istio-workload-dashboard')
        await this.grafanaProvisioner.removeDashboard('mixer-dashboard')
        await this.grafanaProvisioner.removeDashboard('pilot-dashboard')

        await this.grafanaProvisioner.endDashboard()

        return await this.setAppLink('grafana', '')
    }

    // TODO: Get the istio-system namespace from getInstalledApp

    async addDashboard(name) {
        const data = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        await this.grafanaProvisioner.addDashboard(name, data)
    }

    async loadDashboard(name) {
        return await super.readFile(__dirname, `../../../grafana/${name}.json`)
    }
}