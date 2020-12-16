import { customElement } from 'lit-element'
import { StoreFlowStep } from '@provisioner/common'
import { BaseViewSettings } from './base'

@customElement('appengine-install-secrets')
export class AppEngineSecretsSettings extends BaseViewSettings implements StoreFlowStep {

    async begin() {
        super.init()

        this.state.startTimer('ui-secrets-begin')

        this.headingText = `
                <h3>Secrets</h3>
                <p>This data will be captured as Secrets within Kubernetes.</p>
                <p>It will also (typically) be set as an environment variable on the container.</p>`

        this.handleLayout(this.manifest.customSecretFields(), 'secrets')
        this.state.endTimer('ui-secrets-begin')
    }

    async end() {
        return !!this.validateItems(this.manifest.provisioner.secrets)
    }

}