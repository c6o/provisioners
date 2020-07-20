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
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.enviroSelected} label='Environment' value=${this.serviceSpec.environment || 'staging'} required .items=${this.enviroValues}></c6o-combo-box>
                <br />
                <c6o-text-field @input=${this.emailChanged} label="Notify email address" value=${this.serviceSpec.notifyEmail || ''} autoselect required></c6o-text-field>
            </c6o-form-layout>
        `
    }

    enviroSelected = (e) => {
        this.serviceSpec.environment = e.detail.value
    }

    emailChanged = (e) => {
        this.serviceSpec.notifyEmail = e.target.value
    }

    async begin() {
        this.serviceSpec.environment = 'development'
        this.serviceSpec.notifyEmail = 'admin@codezero.io'
    }
}