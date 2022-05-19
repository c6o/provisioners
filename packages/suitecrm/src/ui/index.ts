import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('suitecrm-install-main')
export class SuiteCRMSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    storageSizeChoices = ['1Gi','2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('suitecrm')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-text-field
                    autoselect
                    label="Administrator username"
                    required
                    value=${this.serviceSpec.suitecrmusername}
                    @input=${this.usernameChanged}
                ></c6o-text-field>
                <br />
                <c6o-password-field
                    autoselect
                    label="Administrator password"
                    required
                    value=${this.serviceSpec.suitecrmpassword}
                    @input=${this.passwordChanged}
                ></c6o-password-field>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-combo-box
                    allow-custom-value
                    id="size-combo"
                    .items=${this.storageSizeChoices}
                    label="Database Storage"
                    required
                    value=${this.serviceSpec.databasesize}
                    @selected-item-changed=${this.storageSelected}
                ></c6o-combo-box>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.databasesize = this.serviceSpec.databasesize || '1Gi'
        this.serviceSpec.suitecrmusername = this.serviceSpec.suitecrmusername || 'admin'
        this.serviceSpec.suitecrmpassword = this.serviceSpec.suitecrmpassword || 'admin'
    }

    storageSelected = (e) => {
        this.serviceSpec.databasesize = e.detail.value
    }

    usernameChanged = (e) => {
        this.serviceSpec.suitecrmusername = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.suitecrmpassword = e.target.value
    }
}
