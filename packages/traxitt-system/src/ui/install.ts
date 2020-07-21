import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('c6o-system-setup')
export class TraxittSystemSetup extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('c6o-system')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-text-field @input=${this.companyNameChanged} label="Company Name" path="companyName" autoselect required colspan="2"></c6o-text-field>
                <c6o-text-field @input=${this.clusterNameChanged} label="Cluster Name" path="clusterName" autoselect required colspan="2"></c6o-text-field>
            </c6o-form-layout>
        `
    }

    companyNameChanged = (e) => {
        this.serviceSpec.companyName = e.target.value
    }

    clusterNameChanged = (e) => {
        this.serviceSpec.clusterName = e.target.value
    }
}