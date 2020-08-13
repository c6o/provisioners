import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('vscode-uninstall-main')
export class UninstallVSCode extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('vscode')
    }

    render() {
        return html`
        <c6o-form-layout>
        <c6o-checkbox @checked-changed=${this.checkHandler('keep-ip')} ?checked=${!!this.serviceSpec.deprovision['keep-ip']}>Keep IP address</c6o-checkbox>
        <br />
        <c6o-checkbox @checked-changed=${this.checkHandler('keep-vol')} ?checked=${!!this.serviceSpec.deprovision['keep-vol']}>Keep data volume</c6o-checkbox>
        </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.deprovision = {
            'keep-ip':false,
            'keep-vol':true
        }
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec.deprovision[field] = e.detail.value
    }
}