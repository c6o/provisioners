import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('traxitt-system-setup')
export class TraxittSystemSetup extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('traxitt-system')
    }

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-text-field @input=${this.companyNameChanged} label="Company Name" path="companyName" autoselect required colspan="2"></traxitt-text-field>                
                <traxitt-text-field @input=${this.clusterNameChanged} label="Cluster Name" path="clusterName" autoselect required colspan="2"></traxitt-text-field>
            </traxitt-form-layout>
        `
    }

    companyNameChanged = (e) => {
        this.serviceSpec.companyName = e.target.value
    }

    clusterNameChanged = (e) => {
        this.serviceSpec.clusterName = e.target.value
    }
}