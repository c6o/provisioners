import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('odooerp-install-main')
export class OdooSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    storageSizeChoices = ['1Gi','2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('odooerp')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    allow-custom-value
                    id="storage-combo"
                    .items=${this.storageSizeChoices}
                    label="Database Storage Size"
                    required
                    value=${this.serviceSpec.databaseSize}
                    @selected-item-changed=${this.databaseSizeSelected}
                ></c6o-combo-box>
                <c6o-combo-box
                    allow-custom-value
                    id="size-combo"
                    .items=${this.storageSizeChoices}
                    label="User Addons Storage Size"
                    required
                    value=${this.serviceSpec.shopAddonsDatabaseSize}
                    @selected-item-changed=${this.shopAddonsDatabaseSizeSelected}
                ></c6o-combo-box>
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
