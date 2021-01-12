import { LitElement, customElement, html, property } from 'lit-element'
import { StoreFlowScreen, StoreFlowMediator } from '@provisioner/common'
import { Step, each, AppEngineAppObject } from '@provisioner/appengine-contracts'


@customElement('appengine-step')
export class AppEngineStep extends LitElement implements StoreFlowScreen {

    mediator: StoreFlowMediator

    @property({type: Object})
    manifestHelper: AppEngineAppObject

    @property({type: Object})
    step: Step

    // get skipMediatorRender() { return this.step.skip }

    render() {
        if (this.step.sections)
            return html`${this.step.sections.map(section => html `<appengine-section .section=${section}></appengine-section>`)}`
        return html `<appengine-section .prompts=${this.step.prompts}></appengine-section>`
    }

    async end() {
        this.mediator.applicationSpec = this.manifestHelper.document
        return true
    }
}