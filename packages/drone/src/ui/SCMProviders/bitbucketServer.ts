import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
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
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'gitUsername')}
                    label="Git Username" value=${this.serviceSpec.gitUsername}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'gitPassword')}
                    label="Git Password" value=${this.serviceSpec.gitPassword}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'stashConsumerKey')}
                    label="Stash Consumer Key" value=${this.serviceSpec.stashConsumerKey}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'stashPrivateKey')}
                    label="Stash Private Key" value=${this.serviceSpec.stashPrivateKey}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'stashServer')}
                    label="Stash Server" value=${this.serviceSpec.stashServer}
                    autoselect required>
                </c6o-text-field>
                <br />
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