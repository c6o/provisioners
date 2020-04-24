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
        await this.unlinkGrafana(false)

        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')
        await this.grafanaProvisioner.beginConfig(grafanaNamespace, 'istio-system', 'istio')
        for (const dashboard of dashboards)
            await this.addDashboard(dashboard)

        await this.grafanaProvisioner.endConfig()
    }

    async unlinkGrafana(clearLinkField = true) {
        this.grafanaProvisioner = await this.manager.getProvisioner('grafana')
        await this.grafanaProvisioner.clearConfig('istio-system', 'istio')
        if (clearLinkField)
            delete this.manager.document.provisioner['grafana-link']
    }

    async addDashboard(name) {
        const data = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        await this.grafanaProvisioner.addDashboard(name, data)
    }
}