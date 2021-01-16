import { StoreFlowStep } from '@provisioner/common'
import { LitElement, customElement, html } from 'lit-element'
import { AppEngineAppObject, FlowResult, each } from '@provisioner/appengine-contracts'
import createDebug from 'debug'

const debug = createDebug('@appengine:AppEngineSettings')


export interface AppEngineEndSettings extends StoreFlowStep {

}

@customElement('appengine-install-end')
export class AppEngineEndSettings extends LitElement implements StoreFlowStep {

    _manifestHelper
    get manifestHelper(): AppEngineAppObject {
        if (this._manifestHelper)
            return this._manifestHelper
        return this._manifestHelper = new AppEngineAppObject(this.mediator.applicationSpec)
    }

    // NARAYAN: This is a temporary fix - do not document or use elsewhere
    skipMediatorRender = true;

    // render() {
    //     const json = JSON.stringify(this.mediator.applicationSpec, null, 4)
    //     return html`${json}`
    // }



    async end() {
        const result: FlowResult = {
            transient: {},
            configs: {},
            secrets: {}
        }

        for(const prompt of this._manifestHelper.flattenPrompts()) {
            const target = prompt.c6o.target || 'configs'
            result[target][prompt.name] = prompt.c6o.value
        }

        this.manifestHelper.processResult(result)
        this.manifestHelper.postInquire()
        return true
    }
}