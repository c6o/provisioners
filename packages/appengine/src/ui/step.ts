import { LitElement, customElement, html, property } from 'lit-element'
import { StoreFlowScreen, StoreFlowMediator } from '@provisioner/common'
import { Step, AppEngineAppObject, PromptType } from '@provisioner/appengine-contracts'
import { PromptValidation } from './validation'


@customElement('appengine-step')
export class AppEngineStep extends LitElement implements StoreFlowScreen {

    mediator: StoreFlowMediator

    @property({ type: Object })
    manifestHelper: AppEngineAppObject

    @property({ type: Object })
    step: Step

    // get skipMediatorRender() { return this.step.skip }

    render() {
        if (this.step.sections)
            return html`${this.step.sections.map(section => html`<appengine-section .section=${section}></appengine-section>`)}`
        return html`<appengine-section .prompts=${this.step.prompts}></appengine-section>`
    }

    async end() {
        console.log('APPX step end triggered sections', this.step.sections)
        console.log('APPX step end triggered prompts', this.step.prompts)

        const validation = new PromptValidation()
        const invalidPrompts = validation.validateSectionAndPrompts(this.step.sections, this.step.prompts)

        if (invalidPrompts.length > 0) return this.renderInvalid(invalidPrompts)

        this.mediator.applicationSpec = this.manifestHelper.document
        return true
    }

    renderInvalid(prompts: PromptType) {

        console.log('APPX RENDER INVALID', prompts)
        return false
    }
}
