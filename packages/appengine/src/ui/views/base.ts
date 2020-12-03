import { LitElement, css, CSSResult } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
// @ts-ignore
import { getTimeZones } from '../../templates/latest/timeZones'

export class BaseViewSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    headingText: string
    bodyLayout: any
    pageLayout: any

    get spec() {
        return this.mediator.applicationSpec.spec.provisioner
    }

    static get styles(): (CSSResult[] | CSSResult)[] {
        return [
            css`
                p {
                    margin-bottom: 15px;
                    margin-top: 0;
                }

                h3 {
                    color: #2a343e;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    margin-top: 0;
                }

                .heading-text {
                    margin-bottom: 20px;
                }

                .text-error {
                    color: #ff5a00;
                }
            `
        ]
    }

    render() {
        return this.pageLayout
    }

    handleLayout(items, type) {
        const fieldTypes = ['text', 'password', 'checkbox', 'timezone', 'combobox']

        const headingLayout = document.createElement('div')
        headingLayout.setAttribute('class', 'heading-text')
        headingLayout.innerHTML = this.headingText

        this.pageLayout = document.createElement('section')
        this.pageLayout.appendChild(headingLayout)

        this.bodyLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(this.bodyLayout)

        if (items) {
            for (const item of items) {
                if (fieldTypes.includes(item.fieldType?.toLowerCase())) {
                    this.renderInputField(type, item)
                }
            }
            this.requestUpdate()
        }
    }

    validateItems(items) {
        //required field validation
        for (const item of items) {
            if (item.required && item.required === true) {
                if (!item.value || item.value === '') {
                    const validationFailedField = document.createElement('p')
                    validationFailedField.setAttribute('class', 'text-error')
                    validationFailedField.innerHTML = 'Validation has failed, please try again.'
                    this.bodyLayout.appendChild(validationFailedField)
                    return false
                }
            }
        }
        return true
    }

    renderInputField(type, item) {
        if (!item.fieldType) item.fieldType = 'text'

        if (item.fieldType === 'text') return this.renderTextFiled(type, item)
        if (item.fieldType === 'password') return this.renderTextFiled(type, item)
        if (item.fieldType === 'checkbox') return this.renderCheckboxInputField(type, item)

        if(item.fieldType === 'combobox' && item.items) {
            return this.renderComboList(type, item, item.items)
        }

        if (item.fieldType === 'timezone') {
            const tzList = getTimeZones()
            const zones = []
            for (const group of tzList) {
                for (const zone of group.zones)
                    zones.push(zone.value)
            }
            return this.renderComboList(type, item, zones)
        }

        return false
    }

    renderTextFiled(type, item) {
        const field = document.createElement(`c6o-${item.fieldType}-field`)

        field['label'] = item.name

        if (item.label && item.label !== '')
            field['label'] = item.label

        if (item.required && item.required === true)
            field['required'] = ''

        if (item.autoselect && item.autoselect === true)
            field['autoselect'] = ''

        field['value'] = item.value
        field['id'] = item.name
        if (item.hint) {
            field['alt'] = item.hint
            field['title'] = item.hint
        }

        field.addEventListener('input', e => {
            const event = e as any
            const name = event.target.id
            for (const item of this.spec[type]) {
                if (item.name === name) {
                    item.value = event.target.value
                    break
                }
            }
        })

        this.bodyLayout.appendChild(field)

        return true
    }

    renderCheckboxInputField(type, item) {
        const field = document.createElement('c6o-checkbox')

        if (item.label && item.label !== '')
            field.innerHTML = item.label

        if (item.autoselect && item.autoselect === true)
            field['autoselect'] = ''

        field['id'] = item.name

        if (item.hint) {
            field['alt'] = item.hint
            field['title'] = item.hint
        }

        if (item.value === true) field['checked'] = true

        field.addEventListener('change', e => {
            const event = e as any
            const name = event.target.id
            for (const item of this.spec[type]) {
                if (item.name === name) {
                    item.value = !!event.target.checked
                    break
                }
            }
        })

        this.bodyLayout.appendChild(field)

        return true

    }

    renderComboList(type, item, items) {
        const field = document.createElement('c6o-combo-box')

        field['label'] = item.name

        if (item.label && item.label !== '')
            field['label'] = item.label

        if (item.autoselect && item.autoselect === true)
            field['autoselect'] = ''

        field['id'] = item.name

        if (item.hint) {
            field['alt'] = item.hint
            field['title'] = item.hint
        }

        if (item.value) field['value'] = item.value

        field['items'] = items

        field.addEventListener('change', e => {
            const event = e as any
            const name = event.target.id
            for (const item of this.spec[type]) {
                if (item.name === name) {
                    item.value = event.target.value
                    break
                }
            }
        })

        this.bodyLayout.appendChild(field)

        return true
    }
}