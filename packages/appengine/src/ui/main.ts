import { StoreFlowStep } from '@provisioner/common'
import { customElement } from 'lit-element'
import { TimingReporter } from '../appObject'
import { parser } from '../parser'
import { AppEngineBaseView } from './views/appEngineBaseView'
import createDebug from 'debug'

const debug = createDebug('@appengine:createInquire')

@customElement('appengine-install-main')
export class AppEngineSettings extends AppEngineBaseView implements StoreFlowStep {

    // NARAYAN: This is a temporary fix - do not document or use elsewhere
    skipMediatorRender = true

    async begin() {
        super.init()
        this.state.startTimer('ui-main-begin')

        if (!this.state.parsed)
            await parser.parseInputsToSpec(null, this.manifest)

        if (this.manifest.hasCustomConfigFields())
            this.mediator.appendFlow('appengine-install-configs')
        else if (this.manifest.hasCustomSecretFields())
            this.mediator.appendFlow('appengine-install-secrets')
        else
            new TimingReporter().report(this.state)
        this.state.endTimer('ui-main-begin')
    }
}