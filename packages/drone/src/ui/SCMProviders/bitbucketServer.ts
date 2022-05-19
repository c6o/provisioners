import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-bitbucket-server')
export class DroneBitbucketServerSettings extends LitElement implements StoreFlowStep {

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
                    id="git-username-txt"
                    label="Git Username"
                    required
                    value=${this.serviceSpec.gitUsername}
                    @input=${inputChanged(this.serviceSpec, 'gitUsername')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="git-password-txt"
                    label="Git Password"
                    required
                    value=${this.serviceSpec.gitPassword}
                    @input=${inputChanged(this.serviceSpec, 'gitPassword')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="consumer-key-txt"
                    label="Stash Consumer Key"
                    required
                    value=${this.serviceSpec.stashConsumerKey}
                    @input=${inputChanged(this.serviceSpec, 'stashConsumerKey')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="private-key-txt"
                    label="Stash Private Key"
                    required
                    value=${this.serviceSpec.stashPrivateKey}
                    @input=${inputChanged(this.serviceSpec, 'stashPrivateKey')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    colspan="2"
                    id="server-txt"
                    label="Stash Server"
                    required
                    value=${this.serviceSpec.stashServer}
                    @input=${inputChanged(this.serviceSpec, 'stashServer')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.gitUsername = this.serviceSpec.gitUsername || ''
        this.serviceSpec.gitPassword = this.serviceSpec.gitPassword || ''
        this.serviceSpec.stashConsumerKey = this.serviceSpec.stashConsumerKey || ''
        this.serviceSpec.stashPrivateKey = this.serviceSpec.stashPrivateKey || ''
        this.serviceSpec.stashServer = this.serviceSpec.stashServer || ''
    }
}