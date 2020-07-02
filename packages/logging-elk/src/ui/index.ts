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
            <traxitt-form-layout>
                <traxitt-storage-class
                    id='storageClass'
                    @selected-item-changed=${this.storageClassSelected}
                    required                    
                    label='Storage Class'></traxitt-storage-class>
                <br />
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Log Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
                <br />
                <traxitt-text-field @input=${this.k8sLogIndexPrefixChanged} label="Kubernetes log index prefix?" path="k8sLogIndexPrefix" autoselect required></traxitt-text-field>
            </traxitt-form-layout>
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