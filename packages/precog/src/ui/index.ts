import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('precog-install-main')
export class PreCogSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    values = ['1Gi','2Gi','4Gi']
    editions = ['evaluation', 'enterprise']

    username
    password

    get serviceSpec() {
        return this.mediator.getServiceSpec('precog')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    allow-custom-value
                    id="storage-combo"
                    .items=${this.values}
                    label='Storage'
                    required
                    value=${this.serviceSpec.storage}
                    @selected-item-changed=${this.storageSelected}
                ></c6o-combo-box>
                <c6o-combo-box
                    id="editions-combo"
                    .items=${this.editions}
                    label='Edition'
                    required
                    value=${this.serviceSpec.edition || 'evaluation'}
                    @selected-item-changed=${this.editionSelected}
                ></c6o-combo-box>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-text-field
                    autoselect
                    id="name-txt"
                    label="Docker username"
                    required
                    value=${this.serviceSpec.dockerUsername || ''}
                    @input=${this.usernameChanged}
                ></c6o-text-field>
                <c6o-password-field
                    autoselect
                    id="password-txt"
                    label="Docker password"
                    required
                    value=${this.serviceSpec.dockerPassword || ''}
                    @input=${this.passwordChanged}
                ></c6o-password-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        this.serviceSpec.storage = this.serviceSpec.storage || '2Gi'
    }

    toCredentials() {
        const email = 'ignore@ignored.com' // docker doesn't care about this but it needs to be in the credentials
        const {username, password} = this
        const auth = window.btoa(`${username}:${password}`)
        const credentials = JSON.stringify({auths:{'https://index.docker.io/v1/':{username,password,email,auth}}})
        this.serviceSpec.credentials =  window.btoa(credentials)
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    editionSelected = (e) => {
        this.serviceSpec.edition = e.detail.value
    }

    usernameChanged = (e) => {
        this.username = e.target.value
        this.toCredentials()
    }

    passwordChanged = (e) => {
        this.password = e.target.value
        this.toCredentials()
    }
}