import { LitElement, html, customElement, property } from 'lit-element'

@customElement('nodered-capacity')
export class NodeRedCapacity extends LitElement {
    values = ['500Mi','1Gi','2Gi','4Gi']

    applicationSpec

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Node-RED Storage' value=${this.applicationSpec.services['node-red'].storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
                <br />
                <traxitt-checkbox @checked-changed=${this.projectsCheckChanged} ?checked=${this.applicationSpec.services['node-red'].projects == true}>Enable Projects</traxitt-checkbox>
            </traxitt-form-layout>
        `
    }

    projectsCheckChanged = (e) => {
        this.applicationSpec.services['node-red'].projects = e.detail.value
    }

    storageSelected = (e) => {
        this.applicationSpec.services['node-red'].storage = e.detail.value
    }
}