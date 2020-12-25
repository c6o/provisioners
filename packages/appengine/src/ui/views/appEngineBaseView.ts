
import { StoreFlowMediator, StoreFlowStep } from '@provisioner/common'
import { LitElement } from 'lit-element'
import { AppEngineState, AppManifest, AppObject, Helper } from '../../appObject'
import { parser } from '../../parser'
import createDebug from 'debug'
const debug = createDebug('@appengine:AppEngineBaseView')
export class AppEngineBaseView extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    private _manifest: AppManifest
    get manifest(): AppManifest {
        if (this._manifest)
            return this._manifest
        return this._manifest = new AppObject(this.mediator.applicationSpec) as AppManifest
    }

    private _state: AppEngineState
    get state(): AppEngineState {
        if (this._state)
            return this._state

        this._state = new AppEngineState({
                name: this.manifest.name,
                appId: this.manifest.appId,
                partOf: this.manifest.appId,
                edition: this.manifest.edition,
            })

        if (!this.manifest.provisioner.parsed) {
            parser.parseInputsToSpec(null, this.manifest)
            this._state.parsed = true
        }

        debug('init complete %j', this.manifest)
        debug('init complete %j', this.state)

        return this._state
    }

    helper = new Helper()

    async init() {
        if (this._manifest)
            delete this._manifest
        if (this._state)
            delete this._state
    }
}
