import { AppHelper } from '@provisioner/common'
import { GrafanaProvisioner } from '@provisioner/grafana'
import { baseProvisionerType } from '../../'
import * as Handlebars from 'handlebars'
import { unlinkToken } from '../../constants'
import createDebug from 'debug'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = createDebug('c6o-system:metricsMixin:')

declare module '../..' {
    export interface Provisioner {
        linkGrafana(grafanaNamespace: string, serviceNamespace: string): Promise<void>
        unlinkGrafana(serviceNamespace: string, clearLinkField?: boolean): Promise<void>
    }
}


const dashboards = [
    'dashboard-kubernetes',
    'dashboard-nodejs']

export const metricsMixin = (base: baseProvisionerType) => class extends base {

    grafanaProvisioner

    async linkGrafana(grafanaNamespace, serviceNamespace) {
        await this.unlinkGrafana(serviceNamespace, false)
        this.grafanaProvisioner = await this.controller.resolver.getProvisioner(grafanaNamespace, 'grafana')

        await this.grafanaProvisioner.beginConfig(grafanaNamespace, serviceNamespace, 'c6o-system')

        const prometheusLink = this.spec['prometheus-link'] // see if there's a linked prometheus to reference

        let dataSourceName = '' // use default instead
        if (prometheusLink && prometheusLink !== unlinkToken) {
            dataSourceName = await this.grafanaProvisioner.addDataSource('prometheus', {
                access: 'proxy',
                editable: true,
                isDefault: true,
                jsonData:{
                  timeInterval: '30s'
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
        const grafanaApps = await AppHelper.from(null, 'grafana').list(this.controller.cluster, 'Failed to find Grafana')
        for (const grafanaApp of grafanaApps) {
            const grafanaProvisioner = await this.controller.resolver.getProvisioner<GrafanaProvisioner>(grafanaApp)
            await grafanaProvisioner.clearConfig(grafanaApp.metadata.namespace, serviceNamespace, 'istio')
        }
        if (clearLinkField)
            delete this.controller.resource.spec.provisioner['grafana-link']
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