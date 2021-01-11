import { LitElement, customElement, html, property } from 'lit-element'
import { StoreFlowScreen } from '@provisioner/common'
import { Step, each, AppEngineAppObject } from '@provisioner/appengine-contracts'

@customElement('appengine-step')
export class AppEngineStep extends LitElement implements StoreFlowScreen {

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

    *flattenPrompts() {
        for(const prompt of each(this.step.prompts))
            yield prompt
        for(const section of this.step.sections)
            for(const prompt of each(section.prompts))
                yield prompt
    }

    async end() {
        // We are navigating away.
        for(const prompt of this.flattenPrompts()) {

        }
        return true
    }
}