import { LitElement, customElement, html, property } from 'lit-element'
import { PromptType, Section } from '@provisioner/appengine-contracts'

@customElement('appengine-section')
export class AppEngineSection extends LitElement {

    @property({type: Object})
    section: Section

    @property({type: Object})
    prompts: PromptType

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
                            return html `<appengine-prompt .prompt=${prompt}></appengine-prompt>`
                        }) :
                        html `<appengine-prompt .prompt=${this.renderPrompts}></appengine-prompt>`
                    }
                </c6o-form-layout>
            `
    }

    renderTitle = () => this.section.title ? html`<h2>${this.section?.title}</h2>` : ''
}