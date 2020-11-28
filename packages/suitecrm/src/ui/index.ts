import { LitElement, html, customElement } from 'lit-element'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

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
                <c6o-text-field @input=${this.usernameChanged} label="Administrator username" value=${this.serviceSpec.suitecrmusername} autoselect required></c6o-text-field>
                <br />
                <c6o-password-field @input=${this.passwordChanged} label="Administrator password" value=${this.serviceSpec.suitecrmpassword} autoselect required></c6o-password-field>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.storageSelected} label="Database Storage" value=${this.serviceSpec.databasesize} required allow-custom-value .items=${this.storageSizeChoices}></c6o-combo-box>
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
