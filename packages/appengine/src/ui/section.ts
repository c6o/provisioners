import { LitElement, customElement, html, property } from 'lit-element'
import { AppEngineAppObject, PromptType, Section } from '@provisioner/appengine-contracts'

@customElement('appengine-section')
export class AppEngineSection extends LitElement {

    @property({ type: Object })
    section: Section

    @property({ type: Object })
    prompts: PromptType

    @property({ type: AppEngineAppObject })
    manifestHelper: AppEngineAppObject

    get renderPrompts() {
        return this.section?.prompts || this.prompts
    }

    render() {
        if (this.renderPrompts)
            return html`
                ${this.renderTitle()}
                <c6o-form-layout>
                    ${Array.isArray(this.renderPrompts) ?
                    this.renderPrompts.map(prompt => {
                        return html`<appengine-prompt .manifestHelper=${this.manifestHelper} .prompt=${prompt}></appengine-prompt>`
                    }) :
                        html`<appengine-prompt .manifestHelper=${this.manifestHelper} .prompt=${this.renderPrompts}></appengine-prompt>`
                }
                </c6o-form-layout>
            `
    }

    renderTitle = () => this.section?.title ? html`<h2>${this.section.title}</h2>` : ''
}