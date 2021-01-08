import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-gitlab')
export class DroneGitLabSettings extends LitElement implements StoreFlowStep {

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
                    label="GitLab Client ID"
                    required
                    value=${this.serviceSpec.gitlabClientId}
                    @input=${inputChanged(this.serviceSpec, 'gitlabClientId')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="GitLab Client Secret"
                    required
                    value=${this.serviceSpec.gitlabClientSecret}
                    @input=${inputChanged(this.serviceSpec, 'gitlabClientSecret')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    label="GitLab Server URL"
                    required
                    value=${this.serviceSpec.gitlabUrl}
                    @input=${inputChanged(this.serviceSpec, 'gitlabUrl')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.gitlabClientId = this.serviceSpec.gitlabClientId || ''
        this.serviceSpec.gitlabClientSecret = this.serviceSpec.gitlabClientSecret || ''
        this.serviceSpec.gitlabUrl = this.serviceSpec.gitlabUrl || ''
    }
}