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


        if (this.manifest.hasVolumes()) {
            this.mediator.appendFlow('appengine-uninstall-volumes')
        } else {
            new TimingReporter().report(this.state)
        }
        this.state.endTimer('ui-main-begin')

        await (this.mediator as any).handleNext()

    }
}