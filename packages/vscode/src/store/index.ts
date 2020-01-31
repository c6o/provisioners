import { LitElement, html, customElement } from 'lit-element'

@customElement('vscode-capacity')
export class VSCodeCapacity extends LitElement {
    values = ['1Gi','2Gi','4Gi','8Gi']

    applicationSpec
    publicKey

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Data Volume Size' required allow-custom-value .items=${this.values}></traxitt-combo-box>
                <vaadin-upload max-files="1" @upload-request=${this.upload}>
                    <span slot="drop-label">Drop your public key file here</span>
                </vaadin-upload>
            </traxitt-form-layout>
        `
    }

    storageSelected = (e) => {
        // TODO: just provide the service, not the entire spec?
        this.applicationSpec.services['vscode'].storage = e.detail.value
    }

    upload(event) {
        event.preventDefault()
        const reader = new FileReader()
        reader.onload = (e) => {
            this.publicKey = e.target.result
            this.applicationSpec.services['vscode'].publicKey = this.publicKey
        }
        reader.readAsText(event.detail.file)
        event.detail.file.complete = true
        event.detail.file.status = 'Uploaded'
    }
}

