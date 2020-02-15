import { LitElement, html, customElement, property } from 'lit-element'

@customElement('traxitt-system-setup')
export class TraxittSystemSetup extends LitElement {

    applicationSpec

    service = 'traxitt-system'

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-text-field @input=${this.companyNameChanged} label="Company Name" path="companyName" autoselect required></traxitt-text-field>
                <br />
                <traxitt-text-field @input=${this.clusterNameChanged} label="Cluster Name" path="clusterName" autoselect required></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    companyNameChanged = (e) => {
        if (e.target.value.length)
            this.applicationSpec.services[this.service].companyName = e.target.value
        else
            this.applicationSpec.services[this.service].companyName.reset()
    }

    clusterNameChanged = (e) => {
        if (e.target.value.length)
            this.applicationSpec.services[this.service].clusterName = e.target.value
        else
            this.applicationSpec.services[this.service].clusterName.reset()
    }
}