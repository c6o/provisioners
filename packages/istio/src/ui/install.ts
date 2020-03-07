import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('istio-install-main')
export class IstioSetup extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('istio')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-checkbox @checked-changed=${this.ingressCheckChanged} ?checked=${this.serviceSpec.ingressEnabled == true}>Enable Ingress</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.citadelCheckChanged} ?checked=${this.serviceSpec.citadelEnabled == true}>Enable Citadel</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.telemetryCheckChanged} ?checked=${this.serviceSpec.telemetryEnabled == true}>Enable Telemetry</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.grafanaCheckChanged} ?checked=${this.serviceSpec.grafanaEnabled == true}>Enable Grafana</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.kialiCheckChanged} ?checked=${this.serviceSpec.kialiEnabled == true}>Enable Kiali</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.prometheusCheckChanged} ?checked=${this.serviceSpec.prometheusEnabled == true}>Enable Prometheus</traxitt-checkbox>
                <br />
                <traxitt-text-field @input=${this.usernameChanged} label="Grafana administrator username" path="adminUsername" autoselect required></traxitt-text-field>
                <br />
                <traxitt-text-field @input=${this.passwordChanged} label="Grafana administrator password" path="adminPassword" autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    usernameChanged = (e) => {
        this.serviceSpec.grafanaAdminUsername = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.grafanaAdminPassword = e.target.value
    }

    ingressCheckChanged = (e) => {
        this.serviceSpec.ingressEnabled = e.detail.value
    }

    citadelCheckChanged = (e) => {
        this.serviceSpec.citadelEnabled = e.detail.value
    }

    telemetryCheckChanged = (e) => {
        this.serviceSpec.telemetryEnabled = e.detail.value
    }

    grafanaCheckChanged = (e) => {
        this.serviceSpec.grafanaEnabled = e.detail.value
    }

    kialiCheckChanged = (e) => {
        this.serviceSpec.kialiEnabled = e.detail.value
    }

    prometheusCheckChanged = (e) => {
        this.serviceSpec.prometheusEnabled = e.detail.value
    }
}