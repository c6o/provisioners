import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { inputChanged } from './UIHelper'
import { parser } from '../parser'

@customElement('adminer-install-main')
export class AppEngineSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    fields: any[]

    get spec() {
        return this.mediator.getServiceSpec('appengine')
    }
    render() {
        return
            html`
            <c6o-form-layout>
                HELLO WORLD
            </c6o-form-layout>
            `
    }

    async begin() {

console.log('ALPHA:****************************************')

        debugger



        // set defaults
        const edition = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        this.spec.edition = edition

        if (!this.spec.parsed)
            parser.parseInputsToSpec(null, this.spec)

        if (this.spec.configs) {
            for (const config of this.spec.configs) {
                if(config.value === '$USERNAME')
                    this.fields.push(this.renderUsername(config.name, config))

            }
        }

    }

    renderUsername(fieldName, parent) {
        return html`
        <c6o-text-field
            @input=${inputChanged(parent, fieldName)}
            label="Username" value="${this.spec['fieldName']}"
            autoselect required>
        </c6o-text-field>
        `
    }

}
