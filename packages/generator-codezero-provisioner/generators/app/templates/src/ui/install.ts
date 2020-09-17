import { LitElement, html, customElement } from "lit-element"
import { StoreFlowStep, StoreFlowMediator } from "@provisioner/common"

@customElement("<%= applicationId %>-install-main")
export class ApplicationInstaller extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    values = ["1Gi","2Gi","4Gi"]

    get serviceSpec() {
        // TODO: need to know what service we"re called from
        // mediator should know
        return this.mediator.getServiceSpec("<%= applicationId %>")
    }

    render() {
        return html`
<% if (pvcEnabled) { -%>
            <c6o-form-layout>
                <c6o-combo-box @selected-item-changed=${this.storageSelected} label="<%= applicationName %> Storage" value=${this.serviceSpec.storage} required allow-custom-value .items=${this.values}></c6o-combo-box>
            </c6o-form-layout>
<% } else { -%>
            <c6o-form-layout>
                <c6o-text-field @input=${this.examplePropertyChanged} label="Example Property" value=${this.serviceSpec.exampleProperty || ''} autoselect></c6o-text-field>
            </c6o-form-layout>
<% } -%>
        `
    }

    async begin() {
<% if (pvcEnabled) { -%>
        this.serviceSpec.storage = this.serviceSpec.storage || "2Gi"
<% } else { -%>
        this.serviceSpec.exampleProperty = this.serviceSpec.exampleProperty || "some default"
<% } -%>
    }

<% if (pvcEnabled) { -%>
    storageSelected = (e) => {
        this.serviceSpec.storage = e.detail.value
    }
<% } else { -%>
    examplePropertyChanged = (e) => {
        this.serviceSpec.exampleProperty = e.target.value
    }
<% } -%>
}