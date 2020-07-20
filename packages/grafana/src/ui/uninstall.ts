import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('grafana-uninstall-main')
export class UninstallVSCode extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('grafana')
    }

    render() {
        return html`
        <c6o-form-layout>
          <c6o-checkbox
            @checked-changed=${this.checkHandler('force')}
            ?checked=${!!this.serviceSpec.deprovision['force']}
        >
            Force deprovision with added dashboards
        </c6o-checkbox>
          <br />
        </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.deprovision = {
            'force': false
        }
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec.deprovision[field] = e.detail.value
    }
}