import { StoreFlowStep } from '@provisioner/common'
import { customElement } from 'lit-element'
import { TimingReporter } from '../appObject'
import { AppEngineBaseView } from './views/appEngineBaseView'
import createDebug from 'debug'
const debug = createDebug('@appengine:AppEngineSettings')

@customElement('appengine-install-main')
export class AppEngineSettings extends AppEngineBaseView implements StoreFlowStep {

    async begin() {

        await super.init()

        this.state.startTimer('ui-main-begin')

        let skip = false

        if (this.manifest.hasCustomConfigFields()) {
            this.mediator.appendFlow('appengine-install-configs')
        } else if (this.manifest.hasCustomSecretFields()) {
            this.mediator.appendFlow('appengine-install-secrets')
        } else {
            skip = true
            new TimingReporter().report(this.state)
        }

        this.state.endTimer('ui-main-begin')

        await (this.mediator as any).handleNext(skip) // passing 'true' will skip advancing the handleNext index
    }
}