import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('appsuite-install-main')
export class AppSuiteSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('appsuite')
    }
    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }

}
