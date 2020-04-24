import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

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
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
                <traxitt-combo-box @selected-item-changed=${this.editionSelected} label='Edition' value=${this.serviceSpec.edition || 'evaluation'} required .items=${this.editions}></traxitt-combo-box>
            </traxitt-form-layout>
            <traxitt-form-layout>
                <traxitt-text-field @input=${this.usernameChanged} label="Docker username" value=${this.serviceSpec.dockerUsername || ''} autoselect required></traxitt-text-field>
                <traxitt-password-field @input=${this.passwordChanged} label="Docker password" value=${this.serviceSpec.dockerPassword || ''} autoselect required></traxitt-password-field>
            </traxitt-form-layout>
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