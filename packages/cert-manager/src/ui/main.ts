import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

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
                <c6o-combo-box
                    id="env-combo"
                    .items=${this.enviroValues}
                    label='Environment'
                    required
                    value=${this.serviceSpec.environment || 'staging'}
                    @selected-item-changed=${this.enviroSelected}
                ></c6o-combo-box>
                <br />
                <c6o-text-field
                    autoselect
                    label="Notify email address"
                    required
                    value=${this.serviceSpec.notifyEmail || ''}
                    @input=${this.emailChanged}
                ></c6o-text-field>
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