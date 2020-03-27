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
        <traxitt-form-layout>
        <traxitt-checkbox @checked-changed=${this.checkHandler('keep-ip')} ?checked=${!!this.serviceSpec.deprovision['keep-ip']}>Keep IP address</traxitt-checkbox>
        <br />
        <traxitt-checkbox @checked-changed=${this.checkHandler('keep-vol')} ?checked=${!!this.serviceSpec.deprovision['keep-vol']}>Keep data volume</traxitt-checkbox>
        </traxitt-form-layout>
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