import { customElement } from 'lit-element'
import { StoreFlowStep } from '@provisioner/common'
import { BaseViewSettings } from './base'

@customElement('appengine-install-secrets')
export class AppEngineSecretsSettings extends BaseViewSettings implements StoreFlowStep {

    async begin() {
        super.headingText = `
                <h3>Secrets</h3>
                <p>This data will be captured as Secrets within Kubernetes.</p>
                <p>It will also (typically) be set as an environment variable on the container.</p>`

        super.handleLayout(super.spec.secrets, 'secrets')
    }

    async end() {

        if(!super.validateItems(super.spec.secrets)) return false

        return true
    }

}