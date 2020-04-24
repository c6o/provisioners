import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateApply() {

        // TODO: add to helpers
        // const lastDoc = JSON.parse(this.manager.document.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'])
        const serviceNamespace = this.manager.document.metadata.namespace

        const newGrafanaLink = this.spec['grafana-link']

        if (newGrafanaLink === unlinkToken) {
            this.manager.status?.push(`Unlinking istio from Grafana`)
            await this.unlinkGrafana()
            this.manager.status?.pop()
        }
        else {
            this.manager.status?.push(`Linking istio to Grafana in namespace ${newGrafanaLink}`)
            await this.linkGrafana(newGrafanaLink)
            this.manager.status?.pop()
        }

        const oldPrometheusLink = this.lastSpec?.['prometheus-link']
        const newPrometheusLink = this.spec['prometheus-link']
        if (oldPrometheusLink !== newPrometheusLink) {
            if (oldPrometheusLink) {
                this.manager.status?.push(`Unlinking istio from Prometheus in namespace ${oldPrometheusLink}`)
                await this.unlinkPrometheus(oldPrometheusLink, serviceNamespace)
                this.manager.status?.pop()
            }
            if (newPrometheusLink) {
                this.manager.status?.push(`Linking istio to Prometheus in namespace ${newPrometheusLink}`)
                await this.linkPrometheus(newPrometheusLink, serviceNamespace)
                this.manager.status?.pop()
            }
        }
    
        const oldHttpsRedirect = this.lastSpec?.httpsRedirect
        const newHttpsRedirect = this.spec.httpsRedirect
        if (oldHttpsRedirect !== newHttpsRedirect)
            await this.setHttpsRedirect(newHttpsRedirect)
    }
}