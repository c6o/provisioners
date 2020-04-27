import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updatePrometheus(serviceNamespace) {
        const newPrometheusLink = this.spec['prometheus-link']

        if (newPrometheusLink === unlinkToken) {
            this.manager.status?.push('Unlinking istio from Prometheus')
            await this.unlinkPrometheus(serviceNamespace)
            this.manager.status?.pop()
        }
        else if (newPrometheusLink) {
            this.manager.status?.push(`Linking istio to Prometheus in namespace ${newPrometheusLink}`)
            await this.linkPrometheus(newPrometheusLink, serviceNamespace)
            this.manager.status?.pop()
        }
    }

    async updateGrafana(serviceNamespace) {
        const newGrafanaLink = this.spec['grafana-link']

        if (newGrafanaLink === unlinkToken) {
            this.manager.status?.push('Unlinking istio from Grafana')
            await this.unlinkGrafana(serviceNamespace)
            this.manager.status?.pop()
        }
        else if (newGrafanaLink) {
            this.manager.status?.push(`Linking istio to Grafana in namespace ${newGrafanaLink}`)
            await this.linkGrafana(newGrafanaLink, serviceNamespace)
            this.manager.status?.pop()
        }
    }

    async updateApply() {

        const serviceNamespace = this.manager.document.metadata.namespace

        await this.updatePrometheus(serviceNamespace)
        await this.updateGrafana(serviceNamespace)

        const newHttpsRedirect = !!this.spec.httpsRedirect
        await this.setHttpsRedirect(newHttpsRedirect)
    }
}