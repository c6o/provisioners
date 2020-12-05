import { StoreFlowStep } from '@provisioner/common'
import { customElement } from 'lit-element'
import { TimingReporter } from '../../appObject'
import { BaseViewSettings } from './base'

@customElement('appengine-install-configs')
export class AppEngineConfigsSettings extends BaseViewSettings implements StoreFlowStep {

    async begin() {
        super.headingText = `
                <h3>Configuration</h3>
                <p>This data will be captured as a ConfigMap within Kubernetes.</p>
                <p>It will also (typically) be set as an environment variable on the container.</p>`

        super.handleLayout(super.manifest.provisioner.configs, 'configs')
    }

    async end() {
        if(!super.validateItems(super.manifest.provisioner.configs)) return false
        //intenionally not super
        if (super.state.payload.ui.secrets)
            this.mediator.appendFlow('appengine-install-secrets')
        else
            new TimingReporter().report(this.state)

        return true
    }


}