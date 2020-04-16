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
            <traxitt-form-layout>
                <traxitt-combo-box @selected-item-changed=${this.storageSelected} label='Node-RED Storage' value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></traxitt-combo-box>
            </traxitt-form-layout>
            <traxitt-form-layout>
                <traxitt-checkbox @checked-changed=${this.projectsCheckChanged} ?checked=${this.serviceSpec.projects == true}>Enable Projects</traxitt-checkbox>
            </traxitt-form-layout>
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
}