import { LitElement, customElement, html, property, eventOptions } from 'lit-element'
import { AppEngineAppObject, PromptType, Section } from '@provisioner/appengine-contracts'

@customElement('appengine-section')
export class AppEngineSection extends LitElement {

    @property({ type: Object })
    section: Section

    @property({ type: Object })
    prompts: PromptType

    @property({ type: Object })
    manifestHelper: AppEngineAppObject

    updateRequested = () => {
        console.log('APPX updateREquested in section.ts')
        this.requestUpdate()
    }

    get renderPrompts() {
        return this.section?.prompts || this.prompts
    }

    render() {
        console.log('APPX rendering section.ts', this.manifestHelper.answers)
        if (this.renderPrompts)
            return html`
                ${this.renderTitle()}
                <c6o-form-layout>
                    ${Array.isArray(this.renderPrompts) ?
                    this.renderPrompts.map(prompt => {
                        return html`<appengine-prompt
                            @update-requested=${this.updateRequested}
                            .answers=${this.manifestHelper.answers}
                            .document=${this.manifestHelper.document}
                            .prompt=${prompt}>
                        </appengine-prompt>`
                    }) :
                    html`<appengine-prompt
                        @update-requested=${this.updateRequested}
                        .answers=${this.manifestHelper.answers}
                        .document=${this.manifestHelper.document}
                        .prompt=${this.renderPrompts}>
                    </appengine-prompt>`
                }
                </c6o-form-layout>
            `
    }

    renderTitle = () => this.section?.title ? html`<h2>${this.section.title}</h2>` : ''
}