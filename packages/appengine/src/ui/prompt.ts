import { LitElement, customElement, html, property } from 'lit-element'
import { Prompt, c6oExtensions, isFunctionString, keyValue, AppEngineAppDocument, AppEngineAppObject } from '@provisioner/appengine-contracts'
import { PromptValidation } from './validation'
@customElement('appengine-prompt')
export class AppEnginePrompt extends LitElement {


    seperator = new Array(50 + 1).join('─')
    inquireSeperator = '<<separator>>'

    @property({ type: Object })
    prompt: Prompt

    @property({ type: Boolean })
    showGenerateInput = false

    @property({ type: Object })
    answers: keyValue

    @property({ type: Object })
    document: AppEngineAppDocument

    validation = new PromptValidation()

    get isInValid() {
        return !this.validation.validatePrompt(this.document, this.answers, this.prompt)
    }

    get isDisabled() {
        if (this.prompt.when && isFunctionString(this.prompt.when)) {
            try {
                const func = new Function('answers', this.prompt.when)
                const result = func.call(this.document, this.answers)
                //intentionally left in for 3rd party developers working on their own provisioners
                console.log('APPX WHEN result', prompt, result)
                return result

            } catch (e) {
                //intentionally left in for 3rd party developers working on their own provisioners
                console.log('APPX WHEN Exception:', { prompt, e })
                throw e
            }
            //default to not disabled
            return false
        }
    }

    render() {


        //https://www.npmjs.com/package/inquirer
        //Possible values: input, number, confirm, list, rawlist, expand, checkbox, password, editor
        switch (this.prompt.type) {
            //text input
            case 'input':
                return this.prompt.c6o.generate ? this.renderGenerate() : this.renderInput()

            //number input
            case 'number':
                return this.renderNumber()

            //boolean to confirm, checkbox
            case 'confirm':
                return this.renderCheckbox()

            //combo box, select single
            case 'list':
            case 'rawlist':
                return this.renderList()

            case 'expand':
                return this.renderExpand()

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

    handleInput = (e) => {

        if (typeof e.target.checked != 'undefined')
            this.prompt.c6o.value = e.target.checked
        else
            this.prompt.c6o.value = e.target.value

        if (this.prompt.type === 'number') this.prompt.c6o.value = Number(this.prompt.c6o.value)

        console.log('APPX input updated model', this.prompt)

        //force a re-render so the WHEN can take effect
        this.dispatchEvent(new CustomEvent('update-requested', {
            detail: { message: 'update-requested', prompt: this.prompt, source: e },
            bubbles: true,
            composed: true
        }))
    }


    comboboxRenderer = (root, owner, model) => {
        //pull out all model items
        let { name, label, value, disabled } = model.item
        //default to not disabled
        if (typeof disabled === 'undefined') disabled = false

        //model is a plain string
        if (typeof model.item === 'string') {
            label = value = name = model.item
            //disable only if the value is our seperator
            disabled = (label === this.inquireSeperator)
        }

        //in the case of expand, make sure label is set correctly
        if (name && !label) {
            label = name
            //set the label so it renders, should only be in the "expand" situation where name/value is provided and not label/value
            model.item.label = label
        }

        //if we have a seperator, set the label to be the seperator value
        if (label === this.inquireSeperator) label = this.seperator

        // toggle disabled state
        const item = root.getRootNode().host
        if (disabled || this.isDisabled) {
            item.setAttribute('disabled', '')
            item.style.pointerEvents = 'none'
            item.style.opacity = '0.75'
        } else {
            item.removeAttribute('disabled')
            item.style.pointerEvents = ''
            item.style.opacity = ''
        }

        root.textContent = label
        root.value = value
    }

    renderExpand = () => html`
        <c6o-combo-box
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            .items=${this.prompt.choices}
            value=${this.prompt.c6o.value || ''}
            @selected-item-changed=${this.handleInput}
            .renderer=${this.comboboxRenderer}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
        >
        </c6o-combo-box>
    `
    renderList = () => html`
        <c6o-combo-box
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            .items=${this.prompt.choices}
            item-label-path='name'
            item-value-path='value'
            value=${this.prompt.c6o.value || ''}
            @selected-item-changed=${this.handleInput}
            .renderer=${this.comboboxRenderer}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
        >
        </c6o-combo-box>
    `

    renderInput = () => this.prompt.c6o.generate ? '' : html`
        <c6o-text-field
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            value=${this.prompt.c6o.value || ''}
            @input=${this.handleInput}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
            ?disabled=${this.isDisabled}
        >
        </c6o-text-edit>
    `

    renderNumber = () => html`
        <c6o-number-field
            label=${this.prompt.c6o.label}
            min=${this.prompt.c6o.min || 1}
            max=${this.prompt.c6o.max || 32767}
            step=${this.prompt.c6o.step || 1}
            value=${this.prompt.c6o.value || 1000}
            @change=${this.handleInput}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
            ?has-controls=${this.prompt.c6o.hasControls || true}
            .disabled=${this.isDisabled}
        >
        </c6o-number-field>
        `

    renderPassword = () => html`
        <c6o-password-field
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            value=${this.prompt.c6o.value || ''}
            @input=${this.handleInput}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
            .disabled=${this.isDisabled}
        >
        </c6o-password-field>
    `


    renderGenerate = () => html`
        <c6o-checkbox
            title=${this.prompt.c6o.generateMessage || `Generate a value for ${this.prompt.name}`}
            @checked-changed=${(e) => this.showGenerateInput = !this.showGenerateInput}
            ?checked=${this.prompt.c6o.value}
        >
            ${this.prompt.c6o.label}
        </c6o-checkbox>
        <c6o-text-field
            ?hidden=${!this.showGenerateInput}
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            @input=${this.handleInput}
            required
        >
        </c6o-text-field>
    `
    renderEditor = () => html`
        <c6o-text-area
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            value=${this.prompt.c6o.value || ''}
            @input=${this.handleInput}
            maxlength=${this.prompt.c6o.maxlength}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
            .disabled=${this.isDisabled}
        >
        </c6o-text-area>
    `

    renderMultipleList = () => html`
        <c6o-combo-box
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            .items=${this.prompt.choices}
            value=${this.prompt.c6o.value || ''}
            @selected-item-changed=${this.handleInput}
            .renderer=${this.comboboxRenderer}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
        >
        </c6o-combo-box>
    `

    renderCheckbox = () => html`
        <c6o-checkbox
            label=${this.prompt.c6o.label}
            title=${this.prompt.message}
            ?checked=${this.prompt.c6o.value}
            @change=${this.handleInput}
            ?required=${this.prompt.c6o.required}
            error-message=${this.prompt.c6o.errorMessage}
            .disabled=${this.isDisabled}
            >
            ${this.prompt.c6o.label}
        </c6o-checkbox>
    `
    async connectedCallback() {
        // TODO: Have proper handling for choices etc. as the following only works for input
        this.prompt.c6o = this.prompt.c6o || { value: this.prompt.default }
        await super.connectedCallback()
    }
}
