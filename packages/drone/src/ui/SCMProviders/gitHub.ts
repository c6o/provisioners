import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
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
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'githubClientId')}
                    label="GitHub ClientId" value=${this.serviceSpec.githubClientId}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'githubClientSecret')}
                    label="GitHub Client Secret" value=${this.serviceSpec.githubClientSecret}
                    autoselect required>
                </c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.githubClientId = this.serviceSpec.githubClientId || ''
        this.serviceSpec.githubClientSecret = this.serviceSpec.githubClientSecret || ''
    }
}