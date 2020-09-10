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
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'gitlabClientId')}
                    label="GitLab ClientId" value=${this.serviceSpec.gitlabClientId}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'gitlabClientSecret')}
                    label="GitLab Client Secret" value=${this.serviceSpec.gitlabClientSecret}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'gitlabUrl')}
                    label="GitLab Server URL" value=${this.serviceSpec.gitlabUrl}
                    autoselect required>
                </c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.gitlabClientId = this.serviceSpec.gitlabClientId || ''
        this.serviceSpec.gitlabClientSecret = this.serviceSpec.gitlabClientSecret || ''
        this.serviceSpec.gitlabUrl = this.serviceSpec.gitlabUrl || ''
    }
}