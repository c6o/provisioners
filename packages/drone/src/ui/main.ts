import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { inputChanged } from './UIHelper'

@customElement('drone-install-main')
export class DroneSettingsMain extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    scmChoices = ['GitHub', 'GitHub Enterprise', 'BitBucket Cloud', 'BitBucket Server', 'Gitea', 'GitLab', 'Gogs']
    storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']

    get serviceSpec() {
        return this.mediator.getServiceSpec('drone')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    @selected-item-changed=${inputChanged(this.serviceSpec, 'storageSize')}
                    label="Server Storage"
                    value=${this.serviceSpec.storageSize}
                    required
                    allow-custom-value
                    .items=${this.storageChoices}>
                </c6o-combo-box>
            </c6o-form-layout>
            <c6o-form-layout>
                <c6o-combo-box
                    @selected-item-changed=${inputChanged(this.serviceSpec, 'scmChoice')}
                    label="Source Control System"
                    value=${this.serviceSpec.scmChoice}
                    required
                    .items=${this.scmChoices}>
                </c6o-combo-box>
                </c6o-select>
            </c6o-form-layout>
        `
    }

    async begin() {
        // set defaults
        const editionId = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.serviceSpec.editionId = editionId
        this.serviceSpec.storageSize = this.serviceSpec.storageSize || '5Gi'
        this.serviceSpec.scmChoice = this.serviceSpec.scmChoice || this.scmChoices[0]
    }

    async end() {

        //our scm provider names are templated based on the dropdown list, just replace the spaces in the name with -
        const flow = `drone-install-${this.serviceSpec.scmChoice.replace(/ /g, '-').toLowerCase()}` //fix spaces, tolower
        //add the custom/specific scm provider to the flow
        this.mediator.appendFlow(flow)

        return true
    }
}