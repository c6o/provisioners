import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('vscode-install-main')
export class VSCodeCapacity extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    publicKey
    values = ['1Gi','2Gi','4Gi','8Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('vscode')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    allow-custom-value
                    id="size-combo"
                    .items=${this.values}
                    label='Data Volume Size'
                    required
                    @selected-item-changed=${this.storageSelected}
                ></c6o-combo-box>
                <c6o-form-item label-position="top" colspan="2">
                    <label slot="label">Public Key</label>
                    <vaadin-upload max-files="1" @upload-request=${this.upload}>
                        <span slot="drop-label">Drop your public key file here</span>
                    </vaadin-upload>
                </c6o-form-item>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.storage = this.serviceSpec.storage || '4Gi'
		this.serviceSpec.img = this.serviceSpec.img || 'c6oio/node-dev'
		this.serviceSpec.launch = false
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    upload(e) {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = (e) => {
            this.publicKey = e.target.result
            this.serviceSpec.publicKey = this.publicKey
        }
        reader.readAsText(e.detail.file)
        e.detail.file.complete = true
        e.detail.file.status = 'Uploaded'
    }
}
