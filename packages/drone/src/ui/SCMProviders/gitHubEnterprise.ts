import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-github-enterprise')
export class DroneGitHubEnterpriseSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('drone')
    }

    render() {
        return html`
            <c6o-form-layout>
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3>
                <c6o-checkbox
                    ?checked=${this.serviceSpec.alwaysAuth}
                    id="auth-cb"
                    @checked-changed=${inputChanged(this.serviceSpec, 'alwaysAuth')}
                >
                    Always authenticate (If private mode enabled)
                </c6o-checkbox>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="client-id-txt"
                    label="GitHub Client ID"
                    required
                    value=${this.serviceSpec.githubClientId}
                    @input=${inputChanged(this.serviceSpec, 'githubClientId')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="client-secret-txt"
                    label="GitHub Client Secret" value=${this.serviceSpec.githubClientSecret}
                    required
                    @input=${inputChanged(this.serviceSpec, 'githubClientSecret')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="server-txt"
                    label="GitHub Server URL" value=${this.serviceSpec.githubServer}
                    required
                    @input=${inputChanged(this.serviceSpec, 'githubServer')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.githubClientId = this.serviceSpec.githubClientId || ''
        this.serviceSpec.githubClientSecret = this.serviceSpec.githubClientSecret || ''
        this.serviceSpec.githubServer = this.serviceSpec.githubServer || ''
        this.serviceSpec.alwaysAuth = this.serviceSpec.alwaysAuth || false
    }
}