import { baseProvisionerType } from '../../'
import * as Handlebars from 'handlebars'
import { unlinkToken } from '../../constants'

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

    async linkGrafana(grafanaNamespace, serviceNamespace) {
        await this.unlinkGrafana(serviceNamespace, false)

        await this.grafanaProvisioner.beginConfig(grafanaNamespace, serviceNamespace, 'istio')

        const prometheusLink = this.spec['prometheus-link']

        let dataSourceName

        if (prometheusLink && prometheusLink !== unlinkToken) {
            dataSourceName = await this.grafanaProvisioner.addDataSource('prometheus', {
                access: 'proxy',
                editable: true,
                isDefault: true,
                jsonData:{
                  timeInterval: '5s'
                },
                orgId: 1,
                type: 'prometheus',
                url: `http://prometheus.${prometheusLink}.svc.cluster.local:9090`
            })
        }

        for (const dashboard of dashboards) {
            const params = {
                dataSource: dataSourceName,
                istioNamespace: serviceNamespace
            }
            await this.addDashboard(dashboard, params)
        }

        await this.grafanaProvisioner.endConfig()
    }

    async unlinkGrafana(serviceNamespace, clearLinkField = true) {
        // TODO: which provisioner module/version do we use when we want to target all apps in the system?
        // Stateless: do we loop through all grafana apps here, and call each one individually, moving the code that loops
        // through each grafana app here?
        // Stateful: We can keep state, and unlink to specific grafana as an alternative.
        this.grafanaProvisioner = await this.manager.getProvisionerModule('grafana')
        await this.grafanaProvisioner.clearConfig(serviceNamespace, 'istio')
        if (clearLinkField)
            delete this.manager.document.spec.provisioner['grafana-link']
    }

    async addDashboard(name, params) {
        const source = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        if (!params)
            return await this.grafanaProvisioner.addDashboard(name, source)

        // fill in template with job names, data source
        const template = Handlebars.compile(source, { noEscape: true })
        const content = template(params)
        return await this.grafanaProvisioner.addDashboard(name, content)
    }

}