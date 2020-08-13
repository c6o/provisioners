import { LitElement, html, customElement } from 'lit-element'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('mosquitto-install-main')
export class MosquittoSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    //these choices are based on the mattermost enterprise operator/deployment
    storageSizeChoices = ['2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    get serviceSpec() {
        return this.mediator.getServiceSpec('mattermost')
    }

    render() {
        return html`
            <c6o-form-layout>
                Hello from the mosquitto provisioner
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