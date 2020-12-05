import { StoreFlowStep } from '@provisioner/common'
import { customElement, html } from 'lit-element'
import { TimingReporter } from '../appObject'
import { parser } from '../parser'
import { AppEngineBaseView } from './views/appEngineBaseView'

@customElement('appengine-install-main')
export class AppEngineSettings extends AppEngineBaseView implements StoreFlowStep {

    render() {
        return html`
            <h3>Welcome to the ${this.manifest.displayName} installation.</h3>
            <p>${this.manifest.description}</p>
            <br />
            <br />
            <table width='100%'>
            <tr><td align='right'><p>Press 'Next' to get started with the installation.</p></td></tr>
            </table>
        `
    }

    async begin() {

        super.begin()

        super.state.startTimer('ui-main')

        if (!super.state.parsed)
            parser.parseInputsToSpec(null, super.manifest)

        this.inspectFieldsForInputs()

        super.state.startTimer('ui-main')

    }

    inspectFieldsForInputs() {

        const fieldTypes = ['text', 'password', 'checkbox', 'timezone', 'combobox']
        super.state.payload.ui = { configs: false, secrets: false }

        if (super.manifest.provisioner.configs) {
            for (const config of super.manifest.provisioner.configs) {
                if (fieldTypes.includes(config.fieldType?.toLowerCase())) {
                    config.fieldType = config.fieldType.toLowerCase()
                    super.state.payload.ui.configs = true
                    break
                }
            }
        }
        if (super.manifest.provisioner.secrets) {
            for (const secret of super.manifest.provisioner.secrets) {
                if (fieldTypes.includes(secret.fieldType.toLowerCase())) {
                    secret.fieldType = secret.fieldType.toLowerCase()
                    super.state.payload.ui.secrets = true
                    break
                }
            }
        }

    }

    async end() {


        if (super.state.payload.ui.configs)
            super.mediator.appendFlow('appengine-install-configs')
        else if (super.state.payload.ui.secrets)
            super.mediator.appendFlow('appengine-install-secrets')
        else
            new TimingReporter().report(super.state)

        return true

    }



}
