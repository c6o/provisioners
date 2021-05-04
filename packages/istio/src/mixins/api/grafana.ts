import { baseProvisionerType } from '../../'
import * as Handlebars from 'handlebars'
import { unlinkToken } from '../../constants'
import { GrafanaProvisioner } from '@provisioner/grafana'

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

    async linkGrafana(grafanaNamespace, serviceNamespace) {
        await this.unlinkGrafana(serviceNamespace, false)

        const grafanaProvisioner = await this.manager.getAppProvisioner<GrafanaProvisioner>('grafana', grafanaNamespace)

        await grafanaProvisioner.beginConfig(grafanaNamespace, serviceNamespace, 'istio')

        const prometheusLink = this.spec['prometheus-link']

        let dataSourceName

        if (prometheusLink && prometheusLink !== unlinkToken) {
            dataSourceName = await grafanaProvisioner.addDataSource('prometheus', {
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
            await this.addDashboard(grafanaProvisioner, dashboard, params)
        }

        await grafanaProvisioner.endConfig()
    }

    async unlinkGrafana(serviceNamespace, clearLinkField = true) {
        const grafanaApps = await this.manager.getInstalledApps('grafana')
        for (const grafanaApp of grafanaApps) {
            const grafanaProvisioner = await this.manager.getProvisioner<GrafanaProvisioner>(grafanaApp)
            await grafanaProvisioner.clearConfig(grafanaApp.metadata.namespace, serviceNamespace, 'istio')
        }
        if (clearLinkField)
            delete this.manager.document.spec.provisioner['grafana-link']
    }

    async addDashboard(grafanaProvisioner, name, params) {
        const source = await super.readFile(__dirname, `../../../grafana/${name}.json`)
        if (!params)
            return await grafanaProvisioner.addDashboard(name, source)

        // fill in template with job names, data source
        const template = Handlebars.compile(source, { noEscape: true })
        const content = template(params)
        return await grafanaProvisioner.addDashboard(name, content)
    }

}