import { LitElement, html, customElement, property } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('grafana-install-main')
export class GrafanaCredentials extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    values = ['1Gi','2Gi','4Gi']

    get serviceSpec() {
        // TODO: need to know what service we're called from
        // mediator should know
        return this.mediator.getServiceSpec('grafana')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.storageSelected} label="Grafana Storage" value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></c6o-combo-box>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-text-field @input=${this.usernameChanged} label="Administrator username" value=${this.serviceSpec.adminUsername} autoselect required></c6o-text-field>
                <br />
                <c6o-text-field @input=${this.passwordChanged} label="Administrator password" value=${this.serviceSpec.adminPassword} autoselect required></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.storage = this.serviceSpec.storage || '2Gi'
        this.serviceSpec.adminUsername = this.serviceSpec.adminUsername || 'admin'
        this.serviceSpec.adminPassword = this.serviceSpec.adminPassword || 'admin'
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    usernameChanged = (e) => {
        this.serviceSpec.adminUsername = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.adminPassword = e.target.value
    }
}