import { LitElement, customElement, html, property } from 'lit-element'
import { Prompt } from '@provisioner/appengine-contracts'

@customElement('appengine-prompt')
export class AppEnginePrompt extends LitElement {

    @property({type: Object})
    prompt: Prompt

    @property({type: Boolean})
    showGenerateInput = false

    render() {
        switch(this.prompt.type) {
            case 'input':
            case 'number':
                return this.prompt.c6o?.generate ? this.renderGenerate() :  this.renderInput()
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
                @input=${this.handleInput}
                ?required=${this.prompt.c6o?.required} >
            </c6o-text-edit>
        `

    renderPassword = () => html`
        <c6o-password-field
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            value=${this.prompt.default || ''}
            @input=${(e) => this.prompt.c6o.value = e.target.value}
            ?required=${this.prompt.c6o?.required} >
        >
        </c6o-password-field>
    `


    renderGenerate = () => html`
        <c6o-checkbox
            label=${this.prompt.c6o?.label}
            title=${this.prompt.c6o?.generateMessage || `Generate a value for ${this.prompt.name}`}
            @checked-changed=${(e) => this.showGenerateInput = !this.showGenerateInput}
            checked>
        </c6o-checkbox>
        <c6o-text-field
            ?hidden=${!this.showGenerateInput}
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            @input=${(e) => this.prompt.c6o.value = e.target.value}
            required>
        >
        </c6o-text-field>
    `

    handleInput = (e) => {
        this.prompt.c6o.value = e.target.value
    }

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

    async connectedCallback() {
        // TODO: Have proper handling for choices etc. as the following only works for input
        this.prompt.c6o = this.prompt.c6o || { value: this.prompt.default }
        await super.connectedCallback()
    }
}