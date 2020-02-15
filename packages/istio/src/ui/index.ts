import { LitElement, html, customElement, property } from 'lit-element'

@customElement('istio-install-main')
export class IstioSetup extends LitElement {

    serviceSpec
    installer

    set applicationSpec(spec) {
        this.serviceSpec = spec.services.find( (service) => {
            const serviceName = Object.keys(service)[0]
            return serviceName == "istio"
        })
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-checkbox @checked-changed=${this.ingressCheckChanged} ?checked=${this.serviceSpec["istio"].ingressEnabled == true}>Enable Ingress</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.citadelCheckChanged} ?checked=${this.serviceSpec["istio"].citadelEnabled == true}>Enable Citadel</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.telemetryCheckChanged} ?checked=${this.serviceSpec["istio"].telemetryEnabled == true}>Enable Telemetry</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.grafanaCheckChanged} ?checked=${this.serviceSpec["istio"].grafanaEnabled == true}>Enable Grafana</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.kialiCheckChanged} ?checked=${this.serviceSpec["istio"].kialiEnabled == true}>Enable Kiali</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.prometheusCheckChanged} ?checked=${this.serviceSpec["istio"].prometheusEnabled == true}>Enable Prometheus</traxitt-checkbox>
                <br />
                <traxitt-text-field @input=${this.usernameChanged} label="Grafana administrator username" path="adminUsername" autoselect required></traxitt-text-field>
                <br />
                <traxitt-text-field @input=${this.passwordChanged} label="Grafana administrator password" path="adminPassword" autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    usernameChanged = (e) => {
        if (e.target.value.length)
            this.serviceSpec["istio"].grafanaAdminUsername = e.target.value
        else
            this.serviceSpec["istio"].grafanaAdminUsername.reset()
    }

    passwordChanged = (e) => {
        if (e.target.value.length)
            this.serviceSpec["istio"].grafanaAdminPassword = e.target.value
        else
            this.serviceSpec["istio"].grafanaAdminPassword.reset()
    }

    ingressCheckChanged = (e) => {
        this.serviceSpec["istio"].ingressEnabled = e.detail.value
    }

    citadelCheckChanged = (e) => {
        this.serviceSpec["istio"].citadelEnabled = e.detail.value
    }

    telemetryCheckChanged = (e) => {
        this.serviceSpec["istio"].telemetryEnabled = e.detail.value
    }

    grafanaCheckChanged = (e) => {
        this.serviceSpec["istio"].grafanaEnabled = e.detail.value
    }

    kialiCheckChanged = (e) => {
        this.serviceSpec["istio"].kialiEnabled = e.detail.value
    }

    prometheusCheckChanged = (e) => {
        this.serviceSpec["istio"].prometheusEnabled = e.detail.value
    }
}