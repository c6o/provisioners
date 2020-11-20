import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('jitsi-install-main')
export class JitsiSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('jitsi')
    }

    render() {
        return html`
            <c6o-form-layout>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        const editionId = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.serviceSpec.editionId = editionId
    }

}