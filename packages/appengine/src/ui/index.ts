import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('dockerweb-install-main')
export class SuiteCRMSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('dockerweb')
    }
    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }

}
