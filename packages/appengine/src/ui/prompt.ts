import { LitElement, customElement, html, property } from 'lit-element'
import { Prompt } from '@provisioner/appengine-contracts'

@customElement('appengine-prompt')
export class AppEnginePrompt extends LitElement {

    @property({type: Object})
    prompt: Prompt

    render() {
        switch(this.prompt.type) {
            case 'input':
            case 'number':
                return this.renderInput()
            case 'password':
                return this.renderPassword()
            case 'editor':
                return this.renderEditor()
            case 'list':
            case 'rawlist':
                return this.renderList()
            case 'checkbox':
                return this.renderCheckbox()
            case 'confirm':
                return this.renderConfirm()
            case 'expand':
                return this.renderExpand()
        }
    }

    renderInput = () => this.prompt.c6o.generate ? '' : html`
            <c6o-text-field
                label=${this.prompt.c6o?.label}
                title=${this.prompt.message}
                value=${this.prompt.default || ''}
                ?required=${this.prompt.c6o?.required} >
            </c6o-text-edit>
        `

    renderPassword = () => html`
        <c6o-password-field
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            value=${this.prompt.default || ''}
            ?required=${this.prompt.c6o?.required} >
        >

        </c6o-password-field>
    `
    renderEditor() {

    }

    renderList() {

    }

    renderCheckbox() {

    }

    renderConfirm() {

    }

    renderExpand() {

    }
}