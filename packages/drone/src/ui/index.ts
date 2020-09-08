import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('wordpress-install-main')
export class WordpressSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('wordpress')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-text-field @input=${this.usernameChanged} label="MySql Username" value=${this.serviceSpec.username || ''} autoselect required></c6o-text-field>
                <c6o-password-field @input=${this.passwordChanged} label="MySql Password" value=${this.serviceSpec.password || ''} autoselect required></c6o-password-field>
            </c6o-form-layout>
        `
    }
    usernameChanged = (e) => {
        this.serviceSpec.username = e.target.value
    }

    passwordChanged = (e) => {
        this.serviceSpec.password = e.target.value
    }

    async begin() {
        // set defaults
        const edition = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.serviceSpec.edition = edition
    }
}