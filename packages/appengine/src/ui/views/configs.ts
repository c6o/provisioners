import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('appengine-install-configs')
export class AppEngineConfigsSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    bodyLayout: any
    pageLayout: any

    get spec() {
        return this.mediator.getServiceSpec(this.mediator.applicationSpec.metadata.name)
    }


    get appEngineSpec() {
        return this.mediator.getServiceSpec('appengine')
    }

    render() {
        return this.pageLayout
    }

    async begin() {
        const headingLayout = document.createElement('c6o-form-layout')
        const headingField = document.createElement('p')

        this.pageLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(headingLayout)
        this.bodyLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(this.bodyLayout)


        headingField.innerHTML = `
                <h3>Configuration</h3>
                <p>This data will be captured as a ConfigMap within Kubernetes.</p>
                <p>It will also (typically) be set as an environment variable on the container.</p>`
        headingLayout.appendChild(headingField)

        if (this.spec.configs) {
            for (const item of this.spec.configs) {
                if (item.input === '$USERNAME')
                    this.renderInputField('text', 'configs', item, 'Username')
                if (item.input === '$PASSWORD')
                    this.renderInputField('password', 'configs', item, 'Password')
                    if (item.input === '$SERVERNAME')
                    this.renderInputField('text', 'configs', item, 'Server name')

            }
        }
        this.requestUpdate()

    }

    async end() {

        //required field validation
        for(const item of this.spec.configs) {
            if(item.required && item.required === true) {
                if(!item.value || item.value === '') {
                    console.log('ROBX', 'FAILED VALIDATION', item)
                    const validationFailedField = document.createElement('p')
                    validationFailedField.innerHTML = 'Validation has failed, try again.'
                    this.bodyLayout.appendChild(validationFailedField)
                    return false
                }
            }
        }

        if (this.spec._ui.secrets)
            this.mediator.appendFlow('appengine-install-secrets')
        else
            this.mediator.appendFlow('appengine-install-finished')

        return true
    }

    renderInputField(fieldtype, type, item, label) {

        const field = document.createElement(`c6o-${fieldtype}-field`)
        field['label'] = label
        if(item.label && item.label !== '') {
            field['label'] = item.label
        }
        if(item.required && item.required===true) {
            field['required'] = ''
        }
        if(item.autoselect && item.autoselect===true) {
            field['autoselect'] = ''
        }
        field['value'] = item.value
        field['_id'] = item.name
        if(item.hint) {
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