import { LitElement, html, customElement, property } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('grafana-install-main')
export class GrafanaCredentials extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('grafana')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-text-field @input=${this.usernameChanged} label="Administrator username" value=${this.serviceSpec.adminUsername} autoselect required></traxitt-text-field>
                <br />
                <traxitt-text-field @input=${this.passwordChanged} label="Administrator password" value=${this.serviceSpec.adminPassword} autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    usernameChanged = (e) => {
        this.serviceSpec.adminUsername = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.adminPassword = e.target.value
    }
}