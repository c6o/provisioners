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
            <traxitt-form-layout>
            Hello from Mattermost
            </traxitt-form-layout>
        `
    }

    async begin() {
        // set defaults
    }
}