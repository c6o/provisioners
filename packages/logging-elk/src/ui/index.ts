import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('logging-elk-install-main')
export class LoggingSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    values = ['1Gi','2Gi','5Gi','10Gi','20Gi','50Gi','100Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('logging-elk')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-store-storage-class-combo-box
                    colspan="2"
                    id='storageClass'
                    label='Storage Class'
                    required
                    @selected-item-changed=${this.storageClassSelected}
                ></c6o-store-storage-class-combo-box>
                <c6o-combo-box
                    allow-custom-value
                    colspan="2"
                    label='Log Storage' value=${this.serviceSpec.storage}
                    required
                    .items=${this.values}
                    @selected-item-changed=${this.storageSelected}
                ></c6o-combo-box>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Kubernetes log index prefix?"
                    path="k8sLogIndexPrefix"
                    required
                    @input=${this.k8sLogIndexPrefixChanged}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.storage = this.serviceSpec.storage || '1Gi'
        this.serviceSpec.k8sLogIndexPrefix = this.serviceSpec.k8sLogIndexPrefix || 'cloud'
    }

    storageClassSelected = (e) => {
        this.serviceSpec.storageClass = e.detail.value
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    k8sLogIndexPrefixChanged = (e) => {
        this.serviceSpec.k8sLogIndexPrefix = e.target.value
    }
}