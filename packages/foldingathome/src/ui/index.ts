import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('foldingathome-install-main')
export class FoldingAtHomeSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('foldingathome')
    }

    render() {
        return html`
            <c6o-form-layout>
                <a href='https://apps.foldingathome.org/team' target='_new'>Sign up here</a>
                <br />
                <br />
                <c6o-text-field @input=${this.usernameChanged} label="Username" value=${this.serviceSpec.username || ''} autoselect></c6o-text-field>
                <c6o-password-field @input=${this.passwordChanged} label="Pass Key" value=${this.serviceSpec.passkey || ''} autoselect></c6o-password-field>
                <c6o-text-field @input=${this.teamChanged} label="Team Number" value=${this.serviceSpec.teamNumber || ''} autoselect></c6o-text-field>
            </c6o-form-layout>
        `
    }
    usernameChanged = (e) => {
        this.serviceSpec.username = e.target.value
    }
    teamChanged = (e) => {
        this.serviceSpec.teamNumber = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.passkey = e.target.value
    }

    async begin() {
        // set defaults
        const edition = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.serviceSpec.edition = edition
    }

}