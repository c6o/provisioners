import { customElement } from 'lit-element'
import { StoreFlowStep } from '@provisioner/common'
import { BaseViewSettings } from './base'
import createDebug from 'debug'
const debug = createDebug('@appengine:AppEngineSecretsSettings')
@customElement('appengine-install-secrets')
export class AppEngineSecretsSettings extends BaseViewSettings implements StoreFlowStep {

    async begin() {

        await super.init()

        debug('AppEngineSecretsSettings %j', this.manifest)

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