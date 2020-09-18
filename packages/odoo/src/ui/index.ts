import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('odoo-install-main')
export class OdooSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    storageSizeChoices = ['1Gi','2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('odoo')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.databaseSizeSelected} label="Database Storage Size" value=${this.serviceSpec.databaseSize} required allow-custom-value .items=${this.storageSizeChoices}></c6o-combo-box>
                <c6o-combo-box @selected-item-changed=${this.shopAddonsDatabaseSizeSelected} label="User Addons Storage Size" value=${this.serviceSpec.shopAddonsDatabaseSize} required allow-custom-value .items=${this.storageSizeChoices}></c6o-combo-box>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.databaseSize = this.serviceSpec.databaseSize || '1Gi'
        this.serviceSpec.shopAddonsDatabaseSize = this.serviceSpec.shopAddonsDatabaseSize || '1Gi'
    }

    databaseSizeSelected = (e) => {
        this.serviceSpec.databaseSize = e.detail.value
    }

    shopAddonsDatabaseSizeSelected = (e) => {
        this.serviceSpec.shopAddonsDatabaseSize = e.detail.value
    }

}
