import { StoreFlowStep } from '@provisioner/common'
import { getTimeZones } from '../../templates/latest/timeZones'
import { AppEngineBaseView } from './appEngineBaseView'

export class BaseViewSettings extends AppEngineBaseView implements StoreFlowStep {

    headingText: string
    bodyLayout: any
    pageLayout: any

    render() {
        return this.pageLayout
    }

    handleLayout(items, type) {

        this.state.startTimer('ui-configs-handleLayout')

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
                this.renderInputField(type, item)
            }
            this.requestUpdate()
        }

        this.state.endTimer('ui-configs-handleLayout')

    }

    validateItems(items) {
        //required field validation
        for (const item of items) {
            if (item.required && item.required === true) {
                if (!item.value || item.value === '') {
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

        console.log('ROBX renderInputField', type, item)
        if (!item.fieldType) item.fieldType = 'text'
        if (item.fieldType === 'text') return this.renderTextField(type, item)
        if (item.fieldType === 'password') return this.renderTextField(type, item)
        if (item.fieldType === 'checkbox') return this.renderCheckboxInputField(type, item)
        if (item.fieldType === 'timezone') return this.renderTimezoneField(type, item)
        if (item.fieldType === 'combobox' && item.items) return this.renderComboList(type, item, item.items)

        return false
    }
    renderTimezoneField(type, item) {
        const tzList = getTimeZones()
        const zones = []
        for (const group of tzList) {
            for (const zone of group.zones)
                zones.push({ value: zone.value })
        }
        return this.renderComboList(type, item, zones)
    }

    renderTextField(type, item) {
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
            for (const item of this.manifest.provisioner[type]) {
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
            for (const item of this.manifest.provisioner[type]) {
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

        field['items'] = items.map(({value}) => value)

        field.addEventListener('change', e => {
            const event = e as any
            const name = event.target.id
            for (const item of this.manifest.provisioner[type]) {
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