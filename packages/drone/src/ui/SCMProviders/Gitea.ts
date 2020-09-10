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
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'giteaClientId')}
                    label="Gitea Client Id" value=${this.serviceSpec.giteaClientId}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'giteaClientSecret')}
                    label="Gitea Client Secret" value=${this.serviceSpec.giteaClientSecret}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'giteaUrl')}
                    label="Gitea Server URL" value=${this.serviceSpec.giteaUrl}
                    autoselect required>
                </c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.giteaClientId = this.serviceSpec.giteaClientId || ''
        this.serviceSpec.giteaClientSecret = this.serviceSpec.giteaClientSecret || ''
        this.serviceSpec.giteaUrl = this.serviceSpec.giteaUrl || ''
    }
}