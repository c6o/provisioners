import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('mattermost-install-main')
export class MattermostSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator


    get serviceSpec() {
        return this.mediator.getServiceSpec('mattermost')
    }

    render() {
        return html`
            <c6o-form-layout>
            Hello from Mattermost
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
    }
}