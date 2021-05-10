import { baseProvisionerType } from '../index'
import { unlinkToken } from '../constants'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updatePrometheus(serviceNamespace) {
        const newPrometheusLink = this.spec['prometheus-link']

        if (newPrometheusLink === unlinkToken) {
            super.status?.push('Unlinking istio from Prometheus')
            await this.unlinkPrometheus(serviceNamespace)
            super.status?.pop()
        }
        else if (newPrometheusLink) {
            super.status?.push(`Linking istio to Prometheus in namespace ${newPrometheusLink}`)
            await this.linkPrometheus(newPrometheusLink, serviceNamespace)
            super.status?.pop()
        }
    }

    async updateGrafana(serviceNamespace) {
        const newGrafanaLink = this.spec['grafana-link']

        if (newGrafanaLink === unlinkToken) {
            super.status?.push('Unlinking istio from Grafana')
            await this.unlinkGrafana(serviceNamespace)
            super.status?.pop()
        }
        else if (newGrafanaLink) {
            super.status?.push(`Linking istio to Grafana in namespace ${newGrafanaLink}`)
            await this.linkGrafana(newGrafanaLink, serviceNamespace)
            super.status?.pop()
        }
    }

    async updateApply() {

        const serviceNamespace = super.document.metadata.namespace

        await this.updatePrometheus(serviceNamespace)
        await this.updateGrafana(serviceNamespace)

        const newHttpsRedirect = !!this.spec.httpsRedirect
        await this.setHttpsRedirect(newHttpsRedirect)
    }
}