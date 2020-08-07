import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('node-red-install-main')
export class NodeRedSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator
    values = ['1Gi','2Gi','4Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('node-red')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.storageSelected} label='Node-RED Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></c6o-combo-box>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-checkbox @checked-changed=${this.projectsCheckChanged} ?checked=${this.serviceSpec.projects == true}>Enable Projects</c6o-checkbox>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-store-storage-class-combo-box
                    colspan="2"
                    id="storageClass"
                    label="Storage Class"
                    required
                    @selected-item-changed=${this.storageClassSelected}
                 ></c6o-store-storage-class-combo-box>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        this.serviceSpec.storage = this.serviceSpec.storage || '2Gi'
        this.serviceSpec.projects = this.serviceSpec.projects !== undefined ? this.serviceSpec.projects : false
    }

    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }

    projectsCheckChanged = (e) => {
        this.serviceSpec.projects = e.detail.value
    }


    storageClassSelected = (e) => {
        const storageClassStore = e.detail.value
        if (storageClassStore)
            this.serviceSpec.storageClass = storageClassStore.entity.metadata.name
    }

}