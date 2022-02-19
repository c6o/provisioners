import { StoreFlowStep } from '@provisioner/contracts'
import { LitElement, customElement } from 'lit-element'
import { AppEngineAppHelper, FlowResult } from '@provisioner/appengine-contracts'
import createDebug from 'debug'

const debug = createDebug('@appengine:AppEngineSettings')

export interface AppEngineEndSettings extends StoreFlowStep {

}

@customElement('appengine-install-end')
export class AppEngineEndSettings extends LitElement implements StoreFlowStep {

    _manifestHelper
    get manifestHelper(): AppEngineAppHelper {
        if (this._manifestHelper)
            return this._manifestHelper
        return this._manifestHelper = new AppEngineAppHelper(this.mediator.applicationSpec)
    }

    // NARAYAN: This is a temporary fix - do not document or use elsewhere
    skipMediatorRender = true

    async end() {
        const result: FlowResult = {
            transient: {},
            configs: {},
            secrets: {}
        }

        for(const prompt of this.manifestHelper.flattenPrompts()) {
            const target = prompt.c6o.target || 'configs'
            result[target][prompt.name] = prompt.c6o.value
        }

        this.manifestHelper.processResult(result)
        this.manifestHelper.postInquire()
        return true
    }
}