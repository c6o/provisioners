import { LitElement, html, customElement, property } from 'lit-element'

@customElement('grafana-credentials')
export class GrafanaCredentials extends LitElement {

    applicationSpec

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-text-field @input=${this.usernameChanged} label="Administrator username" path="adminUsername" autoselect required></traxitt-text-field>
                <br />
                <traxitt-text-field @input=${this.passwordChanged} label="Administrator password" path="adminPassword" autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    usernameChanged = (e) => {
        if (e.target.value.length)
            this.applicationSpec.services['grafana'].adminUsername = e.target.value
        else
            this.applicationSpec.services['grafana'].adminUsername.reset()
    }

    passwordChanged = (e) => {
        if (e.target.value.length)
            this.applicationSpec.services['grafana'].adminPassword = e.target.value
        else
            this.applicationSpec.services['grafana'].adminPassword.reset()
    }
}