import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('ghost-install-main')
export class GhostSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('ghost')
    }

    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        const edition = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.serviceSpec.edition = edition
    }

    async end() {
        let valid = true
        await window.customElements.whenDefined('c6o-combo-box')
        this.requestUpdate()
        return valid
    }
}