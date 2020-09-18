import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('odoo-install-main')
export class OdooSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('odoo')
    }
    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }
}
