import { LitElement, html, customElement } from 'lit-element'

@customElement('node-red-install-main')
export class NodeRedSettings extends LitElement {
    values = ['1Gi','2Gi','4Gi']

    serviceSpec
    install

    set installer(installer) {
        this.install = installer
    }

    set applicationSpec(spec) {
        this.serviceSpec = spec.services.find( (service) => {
            const serviceName = Object.keys(service)[0]
            return serviceName == "node-red"
        })
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Node-RED Storage' value=${this.serviceSpec["node-red"].storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
            </traxitt-form-layout>
        `
    }

    storageSelected = (e) => {
        this.serviceSpec["node-red"].storage = e.detail.value
    }

    // demo of multi-stage
    handleNext() {
        debugger
        this.install.setServiceTag('node-red-projects')
        return true
    }
}

@customElement('node-red-projects')
export class NodeRedProjects extends LitElement {

    serviceSpec
    installer

    set applicationSpec(spec) {
        this.serviceSpec = spec.services.find( (service) => {
            const serviceName = Object.keys(service)[0]
            return serviceName == "node-red"
        })
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-checkbox @checked-changed=${this.projectsCheckChanged} ?checked=${this.serviceSpec["node-red"].projects == true}>Enable Projects</traxitt-checkbox>
            </traxitt-form-layout>
        `
    }

    projectsCheckChanged = (e) => {
        this.serviceSpec["node-red"].projects = e.detail.value
    }

    // demo of multi-stage
    handlePrevious() {
        this.installer.setServiceTag('node-red-install-main')
        return true
    }
}