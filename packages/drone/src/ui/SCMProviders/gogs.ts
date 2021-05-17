import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-gogs')
export class DroneGogsSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('drone')
    }

    render() {
        return html`
            <c6o-form-layout>
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Gogs Server URL"
                    required
                    value=${this.serviceSpec.gogsServer}
                    @input=${inputChanged(this.serviceSpec, 'gogsServer')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.gogsServer = this.serviceSpec.gogsServer || ''
    }
}