import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-github')
export class DroneGitHubSettings extends LitElement implements StoreFlowStep {

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
                    label="GitHub Client ID"
                    required
                    value=${this.serviceSpec.githubClientId}
                    @input=${inputChanged(this.serviceSpec, 'githubClientId')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="GitHub Client Secret"
                    required
                    value=${this.serviceSpec.githubClientSecret}
                    @input=${inputChanged(this.serviceSpec, 'githubClientSecret')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.githubClientId = this.serviceSpec.githubClientId || ''
        this.serviceSpec.githubClientSecret = this.serviceSpec.githubClientSecret || ''
    }
}