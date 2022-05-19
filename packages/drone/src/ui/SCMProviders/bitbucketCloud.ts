import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'
import { inputChanged } from '../UIHelper'

@customElement('drone-install-bitbucket-cloud')
export class DroneBitbucketCloudSettings extends LitElement implements StoreFlowStep {

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
                    id="bitbucket-id-txt"
                    label="BitBucket Client Id"
                    required
                    value=${this.serviceSpec.bitbucketClientId}
                    @input=${inputChanged(this.serviceSpec, 'bitbucketClientId')}
                ></c6o-text-field>
                <br />
                <c6o-text-field
                    autoselect
                    id="bitbucket-secret-txt"
                    label="BitBucket Client Secret"
                    required
                    value=${this.serviceSpec.bitbucketClientSecret}
                    @input=${inputChanged(this.serviceSpec, 'bitbucketClientSecret')}
                ></c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.bitbucketClientId = this.serviceSpec.bitbucketClientId || ''
        this.serviceSpec.bitbucketClientSecret = this.serviceSpec.bitbucketClientSecret || ''
    }
}