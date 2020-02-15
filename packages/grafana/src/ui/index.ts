import { LitElement, html, customElement, property } from 'lit-element'

@customElement('grafana-install-main')
export class GrafanaCredentials extends LitElement {

    serviceSpec
    installer

    set applicationSpec(spec) {
        this.serviceSpec = spec.services.find( (service) => {
            const serviceName = Object.keys(service)[0]
            return serviceName == "grafana"
        })
    }

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
            this.serviceSpec['grafana'].adminUsername = e.target.value
        else
            this.serviceSpec['grafana'].adminUsername.reset()
    }

    passwordChanged = (e) => {
        if (e.target.value.length)
            this.serviceSpec['grafana'].adminPassword = e.target.value
        else
            this.serviceSpec['grafana'].adminPassword.reset()
    }
}