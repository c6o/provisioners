import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('appengine-install-main')
export class AppEngineSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('appengine')
    }
    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }

}
