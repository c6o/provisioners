import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
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
                <h3>${this.serviceSpec.scmChoice} SCM Setup</h3><br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'bitbucketClientId')}
                    label="BitBucket Client Id" value=${this.serviceSpec.bitbucketClientId}
                    autoselect required>
                </c6o-text-field>
                <br />
                <c6o-text-field
                    @input=${inputChanged(this.serviceSpec, 'bitbucketClientSecret')}
                    label="BitBucket Client Secret" value=${this.serviceSpec.bitbucketClientSecret}
                    autoselect required>
                </c6o-text-field>
            </c6o-form-layout>
        `
    }

    async begin() {
        this.serviceSpec.bitbucketClientId = this.serviceSpec.bitbucketClientId || ''
        this.serviceSpec.bitbucketClientSecret = this.serviceSpec.bitbucketClientSecret || ''
    }
}