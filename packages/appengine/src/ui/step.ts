import { LitElement, customElement, html, property } from 'lit-element'
import { StoreFlowScreen } from '@provisioner/common'
import { Step } from '@provisioner/appengine-contracts'

@customElement('appengine-step')
export class AppEngineStep extends LitElement implements StoreFlowScreen {

    @property({type: Object})
    step: Step

    // get skipMediatorRender() { return this.step.skip }

    render() {
        if (this.step.sections)
            return html`${this.step.sections.map(section => html `<appengine-section .section=${section}></appengine-section>`)}`
        return html `<appengine-section .prompts=${this.step.prompts}></appengine-section>`
    }
}