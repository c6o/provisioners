import { LitElement, html, customElement, css, CSSResult } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
// @ts-ignore
import { parser } from '../parser'

@customElement('appengine-install-main')
export class AppEngineSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get spec() {
        return this.mediator.applicationSpec.spec.provisioner
    }

    static get styles(): (CSSResult[] | CSSResult)[] {
        return [
            css`
                h3 {
                    color: #2a343e;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    margin-top: 0;
                }

                p {
                    margin-bottom: 15px;
                }

                #description {
                    margin-bottom: 30px;
                }

                #instructions {
                    text-align: right;
                }
            `
        ]
    }

    render() {
        return html`
            <h3>Welcome to the ${this.spec.metaData.display} installation.</h3>
            <p id="description">${this.spec.metaData.description}</p>
            <p id="instructions">Press 'Next' to get started.</p>
        `
    }

    async begin() {
        this.handleMetaData()

        if (!this.spec.parsed)
            parser.parseInputsToSpec(null, this.spec)

        this.inspectFieldsForInputs()
    }

    handleMetaData() {
        this.spec.metaData = this.mediator.applicationSpec.metadata
        this.spec.edition = this.spec.metaData.labels['system.codezero.io/edition']

        if (this.spec.metaData.annotations) {
            this.spec.metaData.appId = this.spec.metaData.annotations['system.codezero.io/appId']
            this.spec.metaData.description = this.spec.metaData.annotations['system.codezero.io/description']
            this.spec.metaData.display = this.spec.metaData.annotations['system.codezero.io/display']
            this.spec.metaData.iconUrl = this.spec.metaData.annotations['system.codezero.io/iconUrl']
            this.spec.metaData.screenshots = this.spec.metaData.annotations['system.codezero.io/screenshots']
            this.spec.metaData.edition = this.spec.metaData.labels['system.codezero.io/edition']
        }
        if (!this.spec.metaData.display) this.spec.metaData.display = this.spec.name
    }

    inspectFieldsForInputs() {
        const fieldTypes = ['text', 'password', 'checkbox', 'timezone', 'combobox']
        this.spec._ui = { configs: false, secrets: false }

        if (this.spec.configs) {
            for (const config of this.spec.configs) {
                if (fieldTypes.includes(config.fieldType?.toLowerCase())) {
                    config.fieldType = config.fieldType.toLowerCase()
                    this.spec._ui.configs = true
                    break
                }
            }
        }
        if (this.spec.secrets) {
            for (const secret of this.spec.secrets) {
                if (fieldTypes.includes(secret.fieldType.toLowerCase())) {
                    secret.fieldType = secret.fieldType.toLowerCase()
                    this.spec._ui.secrets = true
                    break
                }
            }
        }
    }

    async end() {
        if (this.spec._ui.configs)
            this.mediator.appendFlow('appengine-install-configs')
        else if (this.spec._ui.secrets)
            this.mediator.appendFlow('appengine-install-secrets')

        return true
    }
}
