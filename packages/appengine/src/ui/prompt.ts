import { LitElement, customElement, html, property } from 'lit-element'
import { Prompt } from '@provisioner/appengine-contracts'

@customElement('appengine-prompt')
export class AppEnginePrompt extends LitElement {

    @property({ type: Object })
    prompt: Prompt

    @property({ type: Boolean })
    showGenerateInput = false

    render() {
        //https://www.npmjs.com/package/inquirer
        //Possible values: input, number, confirm, list, rawlist, expand, checkbox, password, editor
        switch (this.prompt.type) {
            //text input
            case 'input':
                return this.prompt.c6o?.generate ? this.renderGenerate() : this.renderInput()

            //number input
            case 'number':
                return this.renderNumber()

            //boolean to confirm, checkbox
            case 'confirm':
                return this.renderCheckbox()

            //combo box, select single
            case 'list':
            case 'rawlist':
            case 'expand':
                return this.renderList()

            //drop down list, select multiple
            case 'checkbox':
                return this.renderMultipleList()

            //password input
            case 'password':
                return this.renderPassword()

            //text area input
            case 'editor':
                return this.renderEditor()
        }
    }

    renderInput = () => this.prompt.c6o.generate ? '' : html`
        <c6o-text-field
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            value=${this.prompt.default || ''}
            @input=${this.handleInput}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-text-edit>
    `

    renderNumber = () => html`
        <c6o-number-field
            label=${this.prompt.c6o?.label}
            min=${this.prompt.min || 1}
            max=${this.prompt.max || 32767}
            step=${this.prompt.step || 1}
            value=${this.prompt.default || 1000}
            @input=${this.handleInput}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-number-field>
        `

    renderPassword = () => html`
        <c6o-password-field
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            value=${this.prompt.default || ''}
            @input=${(e) => this.prompt.c6o.value = e.target.value}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-password-field>
    `


    renderGenerate = () => html`
        <c6o-checkbox
            title=${this.prompt.c6o?.generateMessage || `Generate a value for ${this.prompt.name}`}
            @checked-changed=${(e) => this.showGenerateInput = !this.showGenerateInput}
            ?checked=${!this.prompt.default}
        >
            ${this.prompt.c6o?.label}
        </c6o-checkbox>
        <c6o-text-field
            ?hidden=${!this.showGenerateInput}
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            @input=${(e) => this.prompt.c6o.value = e.target.value}
            required
        >
        </c6o-text-field>
    `
    renderEditor = () => html`
        <c6o-text-area
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            value=${this.prompt.default || ''}
            @input=${this.handleInput}
            maxlength=${this.prompt.c6o?.maxlength}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-text-area>
    `
    renderList = () => html `
        <c6o-combo-box
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            .items=${this.prompt.choices}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-combo-box>
    `
    renderMultipleList = () => html `
        <c6o-combo-box
            label=${this.prompt.c6o?.label}
            title=${this.prompt.message}
            .items=${this.prompt.choices}
            ?required=${this.prompt.c6o?.required}
        >
        </c6o-combo-box>
    `

    renderCheckbox = () => html`
        <c6o-checkbox
                label=${this.prompt.c6o?.label}
                title=${this.prompt.message}
                ?checked=${!this.prompt.default}
                ?required=${this.prompt.c6o?.required}
        >
        ${this.prompt.c6o?.label}
        </c6o-checkbox>
    `

    handleInput = (e) => {
        this.prompt.c6o.value = e.target.value
        console.log('APPX VALUE SET', this.prompt)
    }

    async connectedCallback() {
        console.log('APPX connectedCallback', this)
        // TODO: Have proper handling for choices etc. as the following only works for input
        this.prompt.c6o = this.prompt.c6o || { value: this.prompt.default }
        await super.connectedCallback()
    }
}