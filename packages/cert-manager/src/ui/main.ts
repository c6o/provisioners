import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('cert-manager-install-main')
export class CertManagerSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    enviroValues = ['development', 'staging', 'production']

    get serviceSpec() {
        return this.mediator.getServiceSpec('cert-manager')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.enviroSelected} label='Environment' value=${this.serviceSpec.evironment} required .items=${this.enviroValues}></traxitt-combo-box>
                <br />
                <traxitt-text-field @input=${this.emailChanged} label="Notify email address" value=${this.serviceSpec.notifyEmail} autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    enviroSelected = (e) => {
        switch(e.detail.value) {
            case 'production' :
                this.serviceSpec.staging = '' // empty for production
            case 'development' :
            case 'staging' :
            default :
                this.serviceSpec.staging = '-staging' // appends -staging to cert-manager
        }
    }

    emailChanged = (e) => {
        this.serviceSpec.notifyEmail = e.target.value
    }

    async begin() {
        //this.mediator.appendFlow('node-red-projects')
    }
}