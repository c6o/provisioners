import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('node-red-install-main')
export class NodeRedSettings extends LitElement implements StoreFlowStep {
    values = ['1Gi','2Gi','4Gi']

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('node-red')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Node-RED Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
            </traxitt-form-layout>
        `
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    async begin() {
        this.mediator.appendFlow('node-red-projects')
    }
}