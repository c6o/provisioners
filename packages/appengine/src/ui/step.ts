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

    @property({ type : Boolean })
    hasError = false

    render() {
        //const error = ''
        //if(this.hasError) html`<c6o-label @visible='${this.hasError}' theme='error'>'There was an error, please correct the issues before proceeding.'</c6o-label>`
        if (this.step.sections)
            return html`${this.step.sections.map(section =>
                html`<appengine-section .section=${section}></appengine-section><c6o-label theme='error'>${this.hasError?'There was an error, please correct the issues before proceeding.':''}</c6o-label>`)}`

        return html`<appengine-section .prompts=${this.step.prompts}></appengine-section><c6o-label theme='error'>${this.hasError?'There was an error, please correct the issues before proceeding.':''}</c6o-label>`
    }

    async end() {
        const validation = new PromptValidation()
        const invalidPrompts = validation.validateSectionAndPrompts(this.manifestHelper, this.step.sections, this.step.prompts)

        if (invalidPrompts.length > 0) return this.renderInvalid(invalidPrompts)

        this.mediator.applicationSpec = this.manifestHelper.document
        return true
    }

    renderInvalid(prompts: PromptType) {
        //TODO: Show some UI element to indicate required items failed
        console.log('APPX RENDER INVALID', prompts)
        this.hasError = true
        this.render()
        return false
    }
}
