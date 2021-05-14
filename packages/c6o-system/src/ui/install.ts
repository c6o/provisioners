import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('c6o-system-setup')
export class TraxittSystemSetup extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('c6o-system')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Company Name"
                    path="companyName"
                    required
                    @input=${this.companyNameChanged}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Cluster Name"
                    path="clusterName"
                    required
                    @input=${this.clusterNameChanged}
                ></c6o-text-field>
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