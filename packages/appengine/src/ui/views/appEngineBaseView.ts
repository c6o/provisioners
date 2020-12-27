
import { StoreFlowMediator, StoreFlowStep } from '@provisioner/common'
import { LitElement } from 'lit-element'
import { AppEngineState, AppManifest, AppObject, Helper } from '../../appObject'
import { parser } from '../../parser'
import createDebug from 'debug'
const debug = createDebug('@appengine:AppEngineBaseView')
export class AppEngineBaseView extends LitElement implements StoreFlowStep {

    manifest: AppManifest
    mediator: StoreFlowMediator
    state: AppEngineState
    helper = new Helper()

    async init() {

        this.manifest = this.manifest || new AppObject(this.mediator.applicationSpec) as AppManifest

        this.state = this.state || new AppEngineState(
            {
                name: this.manifest.name,
                appId: this.manifest.appId,
                partOf: this.manifest.appId,
                edition: this.manifest.edition
            })

        if (!this.manifest.provisioner.parsed) {
            await parser.parseInputsToSpec(null, this.manifest)
            this.state.parsed = true
        }

        debug('init complete %j', this.manifest)
        debug('init complete %j', this.state)
    }
}
