import { LitElement, customElement, html, property } from 'lit-element'
import { StoreFlowScreen, StoreFlowMediator } from '@provisioner/contracts'
import { Step, AppEngineAppHelper, PromptType, Prompt, c6oExtensions } from '@provisioner/appengine-contracts'
import { PromptValidation } from './validation'
// @ts-ignore
import { getTimeZonesFlatten } from '../templates/timeZones'

@customElement('appengine-step')
export class AppEngineStep extends LitElement implements StoreFlowScreen {

    mediator: StoreFlowMediator

    @property({ type: Object })
    manifestHelper: AppEngineAppHelper

    @property({ type: Object })
    step: Step

    @property({ type: Boolean })
    hasError = false

    render() {
        // const error = ''
        // if(this.hasError) html`<c6o-label @visible='${this.hasError}' theme='error'>'There was an error, please correct the issues before proceeding.'</c6o-label>`
        if (this.step.sections)
            return html`${this.step.sections.map(section =>
                html`<appengine-section .section=${section} .manifestHelper=${this.manifestHelper}></appengine-section>
                     <c6o-label theme='error'>${this.hasError ? 'There was an error, please correct the issues before proceeding.' : ''}</c6o-label>`)}`

        return html`<appengine-section .prompts=${this.step.prompts} .manifestHelper=${this.manifestHelper}></appengine-section>
                     <c6o-label theme='error'>${this.hasError ? 'There was an error, please correct the issues before proceeding.' : ''}</c6o-label>`
    }

    async begin() {
        Array.from(this.manifestHelper.flattenPrompts()).forEach(p => this.setDefaultValueAndRequired(p))
    }

    setDefaultValueAndRequired(prompt: Prompt) {
        // at this point, we are just going to copy all default values over to the value itself
        // and when the UI loads, we will use the value to pre-populate the UI
        // after testing some of the UI controls did not handle setting default values consistently
        // so we do things explicitly

        // set default values to the actual values, only when the value has never been set, regardless of truesy or falsy state
        if (typeof prompt.c6o?.value === 'undefined') {
            prompt.c6o = prompt.c6o || {} as c6oExtensions
            if (prompt.default) {
                prompt.c6o.value = prompt.default
                //if we have a choices array, pluck the item from the array
                if (prompt.choices) prompt.c6o.value = prompt.choices[prompt.default as number]
            }
            if (prompt.type === 'number') {
                prompt.c6o.value = prompt.c6o.value || 1000
                if (prompt.c6o.min && prompt.c6o.value < prompt.c6o.min) prompt.c6o.value = prompt.c6o.min
                if (prompt.c6o.max && prompt.c6o.value > prompt.c6o.max) prompt.c6o.value = prompt.c6o.max
            }
            if (prompt.type === 'confirm') {
                prompt.c6o.value = prompt.default || false
            }
        }

        // if we have a validation expression and it is NOT required, set the fact that it is now required
        if (prompt.validate && !prompt.c6o?.required) {
            prompt.c6o = prompt.c6o || { value: '' }
            prompt.c6o.required = true
        }

        if (prompt.c6o?.dataSource === 'timezone') {
            if (!prompt.choices) prompt.choices = []
            prompt.choices = prompt.choices.concat(Array.from(getTimeZonesFlatten()))
        }
    }

    async end() {

        // validate
        const validation = new PromptValidation()
        const invalidPrompts = validation.validateSectionAndPrompts(this.manifestHelper, this.step.sections, this.step.prompts)

        // if invalid, indicate so in the UI
        if (invalidPrompts.length)
            return this.renderInvalid(invalidPrompts)
        else
            console.log('APPX, VALIDATION - no validation issues, proceeding...', invalidPrompts)

        // if valid, update appspec
        this.mediator.applicationSpec = this.manifestHelper.resource
        return true
    }

    renderInvalid(prompts: PromptType) {
        this.hasError = true
        this.render()
        return false
    }
}
