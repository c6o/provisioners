import { LitElement, html, customElement } from "lit-element"
import { StoreFlowStep, StoreFlowMediator } from "@provisioner/common"

@customElement("<%= applicationId %>-uninstall-main")
export class ApplicationUninstaller extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec("<%= applicationId %>")
    }

    render() {
        return html`
        <c6o-form-layout>
        </c6o-form-layout>
        `
    }

    async begin() {
    }
}