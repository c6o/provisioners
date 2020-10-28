import { LitElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

export class BaseViewSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    headingText: string
    bodyLayout: any
    pageLayout: any

    get spec() {
        return this.mediator.applicationSpec.spec.provisioner
    }

    render() {
        console.log('ROBX', 'render', this.pageLayout)

        return this.pageLayout
    }
    handleLayout(items, type) {

        console.log('ROBX', 'handleLayout', items)

        const fieldTypes = ['TEXT']

        const headingLayout = document.createElement('c6o-form-layout')
        const headingField = document.createElement('p')

        this.pageLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(headingLayout)
        this.bodyLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(this.bodyLayout)


        headingField.innerHTML = this.headingText

        headingLayout.appendChild(headingField)

        if (items) {
            for (const item of items) {
                if (item.type && item.type !== '' && fieldTypes.includes(item.type)) {
                    if (!item.fieldType) item.fieldType = 'text'
                    item.fieldType = item.fieldType.toLowerCase()
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
                    console.log('ROBX', 'FAILED VALIDATION', item)
                    const validationFailedField = document.createElement('p')
                    validationFailedField.innerHTML = 'Validation has failed, try again.'
                    this.bodyLayout.appendChild(validationFailedField)
                    return false
                }
            }
        }
        return true
    }

    renderInputField(type, item) {

        if (!item.fieldType) item.fieldType = 'text'
        const field = document.createElement(`c6o-${item.fieldType}-field`)
        field['label'] = item.name
        if (item.label && item.label !== '') {
            field['label'] = item.label
        }
        if (item.required && item.required === true) {
            field['required'] = ''
        }
        if (item.autoselect && item.autoselect === true) {
            field['autoselect'] = ''
        }
        field['value'] = item.value
        field['_id'] = item.name
        if (item.hint) {
            field['alt'] = item.hint
            field['title'] = item.hint
        }

        field.addEventListener('input', e => {
            const event = e as any
            const name = event.target._id
            for (const item of this.spec[type]) {
                if (item.name === name) {
                    item.value = event.target.value
                    break
                }
            }
        })

        this.bodyLayout.appendChild(field)
    }

}