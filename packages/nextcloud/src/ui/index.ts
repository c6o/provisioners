import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('nextcloud-install-main')
export class NextCloudSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    values = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('nextcloud')
    }

    // TODO: add optional advanced options allowing user to specify remote SQL server (or SQLite??).
    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.storageSelected} label='NextCloud Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></c6o-combo-box>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-text-field @input=${this.usernameChanged} label="Administrator Username" value=${this.serviceSpec.adminUsername} autoselect required></c6o-text-field>
                <c6o-password-field @input=${this.passwordChanged} label="Administrator Password" value=${this.serviceSpec.adminPassword} autoselect required></c6o-password-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        this.serviceSpec.storage = this.serviceSpec.storage || '2Gi'
        this.serviceSpec.adminUsername = this.serviceSpec.adminUsername !== undefined ? this.serviceSpec.adminUsername : 'Admin'
        this.serviceSpec.adminPassword = ''
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