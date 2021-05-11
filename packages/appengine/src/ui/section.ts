import { LitElement, customElement, html, property } from 'lit-element'
import { AppEngineAppHelper, PromptType, Section } from '@provisioner/appengine-contracts'

@customElement('appengine-section')
export class AppEngineSection extends LitElement {

    @property({ type: Object })
    section: Section

    @property({ type: Object })
    prompts: PromptType

    @property({ type: Object })
    manifestHelper: AppEngineAppHelper

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
                            return html`
                                <appengine-prompt
                                    .answers=${this.manifestHelper.answers}
                                    .document=${this.manifestHelper.document}
                                    .prompt=${prompt}
                                    @update-requested=${this.updateRequested}
                                ></appengine-prompt>
                            `
                        })
                    : html`
                        <appengine-prompt
                            .answers=${this.manifestHelper.answers}
                            .document=${this.manifestHelper.document}
                            .prompt=${this.renderPrompts}
                            @update-requested=${this.updateRequested}
                        ></appengine-prompt>
                    `}
                </c6o-form-layout>
            `
    }

    renderTitle = () => this.section?.title ? html`<h2>${this.section.title}</h2>` : ''

    updateRequested = () => {
        this.requestUpdate()
    }
}