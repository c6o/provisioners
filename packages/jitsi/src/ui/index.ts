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
                <c6o-password-field @input=${this.secretChanged} label="JICOFO Component Secret" value=${this.serviceSpec.secret || ''} autoselect required></c6o-password-field>
                <c6o-password-field @input=${this.authPasswordChanged} label="JICOFO Auth Password" value=${this.serviceSpec.authPassword || ''} autoselect required></c6o-password-field>
                <c6o-password-field @input=${this.jvbPasswordChanged} label="JVB Auth Password" value=${this.serviceSpec.jvbPassword || ''} autoselect required></c6o-password-field>
            </c6o-form-layout>
        `
    }
    secretChanged = (e) => {
        this.serviceSpec.secret = e.target.value
    }

    authPasswordChanged = (e) => {
        this.serviceSpec.authPassword = e.target.value
    }

    jvbPasswordChanged = (e) => {
        this.serviceSpec.jvbPassword = e.target.value
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