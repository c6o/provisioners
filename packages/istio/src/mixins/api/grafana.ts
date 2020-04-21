import { baseProvisionerType } from '../../'

const dashboards = [
    'citadel-dashboard',
    'galley-dashboard',     // this and following use prometheus plugin
    'istio-mesh-dashboard',
    'istio-performance-dashboard',
    'istio-service-dashboard',
    'istio-workload-dashboard',
    'mixer-dashboard',
    'pilot-dashboard']

export const grafanaMixin = (base: baseProvisionerType) => class extends base {
    appNamespace
    grafanaProvisioner

    async linkGrafana(grafanaNamespace) {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')

        await this.grafanaProvisioner.beginDashboard(grafanaNamespace, 'istio')

        for (const dashboard of dashboards)
            await this.addDashboard(dashboard)

        await this.grafanaProvisioner.endDashboard()
    }

    async unlinkGrafana(grafanaNamespace) {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')
        await this.grafanaProvisioner.beginDashboard(grafanaNamespace, 'istio')

        for (const dashboard of dashboards)
            await this.grafanaProvisioner.removeDashboard(dashboard)
        
        await this.grafanaProvisioner.endDashboard()
    }

    async addDashboard(name) {
        const data = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        await this.grafanaProvisioner.addDashboard(name, data)
    }
}