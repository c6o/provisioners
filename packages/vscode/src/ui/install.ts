import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('vscode-install-main')
export class VSCodeCapacity extends LitElement implements StoreFlowStep {
    values = ['1Gi','2Gi','4Gi','8Gi']

    publicKey

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('vscode')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box
                    @selected-item-changed=${this.storageSelected}
                    label='Data Volume Size'
                    required
                    allow-custom-value
                    .items=${this.values}>
                </traxitt-combo-box>
                <traxitt-form-item label-position="top" colspan="2">
                    <label slot="label">Public Key</label>
                    <vaadin-upload max-files="1" @upload-request=${this.upload}>
                        <span slot="drop-label">Drop your public key file here</span>
                    </vaadin-upload>
                </traxitt-form-item>
            </traxitt-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.storage = this.serviceSpec.storage || '4Gi'
		this.serviceSpec.img = this.serviceSpec.img || 'traxitt/node-dev'
		this.serviceSpec.launch = false
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    upload(event) {
        event.preventDefault()
        const reader = new FileReader()
        reader.onload = (e) => {
            this.publicKey = e.target.result
            this.serviceSpec.publicKey = this.publicKey
        }
        reader.readAsText(event.detail.file)
        event.detail.file.complete = true
        event.detail.file.status = 'Uploaded'
    }
}

