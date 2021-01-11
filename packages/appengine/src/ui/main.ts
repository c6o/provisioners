import { StoreFlowStep } from '@provisioner/common'
import { LitElement, customElement, html } from 'lit-element'
import { AppEngineAppObject, Step, each } from '@provisioner/appengine-contracts'
import { AppEngineStep } from './step'
import { AppEngineEndSettings } from './end'
import createDebug from 'debug'

const debug = createDebug('@appengine:AppEngineSettings')

export interface AppEngineSettings extends StoreFlowStep {

}

@customElement('appengine-install-main')
export class AppEngineSettings extends LitElement implements StoreFlowStep {

    _manifestHelper
    get manifestHelper(): AppEngineAppObject {
        if (this._manifestHelper)
            return this._manifestHelper
        return this._manifestHelper = new AppEngineAppObject(this.mediator.applicationSpec)
    }

    // NARAYAN: This is a temporary fix - do not document or use elsewhere
    skipMediatorRender = true

    async begin() {

        if (this.manifestHelper.flow) {

            debug('Received flow', this.manifestHelper.flow)

            //@ts-ignore
            window.manifestFlow = this.manifestHelper.flow
            //@ts-ignore
            window.mediator = this.mediator

            const stepViews = []
            for(const step of each(this.manifestHelper.flow)) {
                const stepView = document.createElement('appengine-step') as AppEngineStep
                stepView.manifestHelper = this.manifestHelper
                stepView.step = step as Step
                stepViews.push(stepView)
            }

            const endView = document.createElement('appengine-install-end') as AppEngineEndSettings

            this.mediator.appendFlow(...stepViews, endView)
        }
    }

    // async end() {
    //     return true
    // }
}