import { StoreFlowStep } from '@provisioner/common'
import { customElement } from 'lit-element'
import { TimingReporter } from '../../appObject'
import { BaseViewSettings } from './base'

@customElement('appengine-install-configs')
export class AppEngineConfigsSettings extends BaseViewSettings implements StoreFlowStep {

    async begin() {
        super.init()

        this.state.startTimer('ui-configs-begin')

        this.headingText = `
                <h3>Configuration</h3>
                <p>This data will be captured as a ConfigMap within Kubernetes.</p>
                <p>It will also (typically) be set as an environment variable on the container.</p>`

        this.handleLayout(this.manifest.customConfigFields(), 'configs')
        this.state.endTimer('ui-configs-begin')

    }

    async end() {
        if(!this.validateItems(this.manifest.provisioner.configs)) return false

        if (this.manifest.hasCustomSecretFields()) {
            this.mediator.appendFlow('appengine-install-secrets')
        } else {
            new TimingReporter().report(this.state)
        }
        return true
    }


}