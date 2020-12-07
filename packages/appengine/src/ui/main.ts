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
        super.init()
        this.state.startTimer('ui-main-begin')

        if (!this.state.parsed)
            parser.parseInputsToSpec(null, this.manifest)

        this.state.endTimer('ui-main-begin')


    }

    async end() {


        if (this.manifest.hasCustomConfigFields()) {
            console.log('ROBX main has configs, will transition to configs')
            this.mediator.appendFlow('appengine-install-configs')
        } else if (this.manifest.hasCustomSecretFields()) {
            console.log('ROBX main has secrets, will transition to configs')
            this.mediator.appendFlow('appengine-install-secrets')
        } else {
            new TimingReporter().report(this.state)
        }

        return true

    }



}
