import { StoreFlowStep } from '@provisioner/common'
import { customElement, html } from 'lit-element'
import { TimingReporter } from '../appObject'
import { parser } from '../parser'
import { AppEngineBaseView } from './views/appEngineBaseView'

@customElement('appengine-install-main')
export class AppEngineSettings extends AppEngineBaseView implements StoreFlowStep {

    async begin() {
        super.init()
        this.state.startTimer('ui-main-begin')

        if (!this.state.parsed)
            parser.parseInputsToSpec(null, this.manifest)


        if (this.manifest.hasCustomConfigFields()) {
            this.mediator.appendFlow('appengine-install-configs')
        } else if (this.manifest.hasCustomSecretFields()) {
            this.mediator.appendFlow('appengine-install-secrets')
        } else {
            new TimingReporter().report(this.state)
        }
        this.state.endTimer('ui-main-begin')

        console.log(this.state)

        await (this.mediator as any).handleNext()

    }
}