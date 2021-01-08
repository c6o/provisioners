import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-gitea')
export class DroneGiteaSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('drone')
    }

    render() {
        return html`
            <c6o-form-layout>
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Gitea Client ID"
                    required
                    value=${this.serviceSpec.giteaClientId}
                    @input=${inputChanged(this.serviceSpec, 'giteaClientId')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Gitea Client Secret"
                    required
                    value=${this.serviceSpec.giteaClientSecret}
                    @input=${inputChanged(this.serviceSpec, 'giteaClientSecret')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="Gitea Server URL"
                    required
                    value=${this.serviceSpec.giteaUrl}
                    @input=${inputChanged(this.serviceSpec, 'giteaUrl')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.giteaClientId = this.serviceSpec.giteaClientId || ''
        this.serviceSpec.giteaClientSecret = this.serviceSpec.giteaClientSecret || ''
        this.serviceSpec.giteaUrl = this.serviceSpec.giteaUrl || ''
    }
}