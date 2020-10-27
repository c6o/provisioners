import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { parser } from '../parser'

@customElement('appengine-install-main')
export class AppEngineSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get spec() {
        return this.mediator.getServiceSpec(this.mediator.applicationSpec.metadata.name)
    }


    get appEngineSpec() {
        return this.mediator.getServiceSpec('appengine')
    }

    render() {
        return html`
        <h3>Welcome to the ${this.spec.metaData.display} installation.</h3>
        <p>${this.spec.metaData.description}</p>
        <br />
        <br />
        <table width='100%'>
        <tr><td align='right'><p>Press 'Next' to get started with the installation.</p></td></tr>
        </table>
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
        }
        if (!this.spec.metaData.display) this.spec.metaData.display = this.spec.name

    }

    inspectFieldsForInputs() {

        const fieldTypes = ['$USERNAME', '$PASSWORD', '$SERVERNAME']
        this.spec._ui = { configs: false, secrets: false }

        if (this.spec.configs) {
            for (const config of this.spec.configs) {
                if (fieldTypes.includes(config.value) || fieldTypes.includes(config.type)) {
                    if (!config.input || config.input === '')
                        config.input = config.value

                    if (fieldTypes.includes(config.value))
                        config.value = ''

                    this.spec._ui.configs = true
                }
            }
        }
        if (this.spec.secrets) {
            for (const secret of this.spec.secrets) {
                if (fieldTypes.includes(secret.value) || fieldTypes.includes(secret.type)) {
                    if (!secret.input || secret.input === '')
                        secret.input = secret.value

                    if (fieldTypes.includes(secret.value))
                        secret.value = ''

                    this.spec._ui.secrets = true
                }
            }
        }

        console.log('ROBX', 'AppEngine Main', this.spec)
    }

    async end() {


        if (this.spec._ui.configs)
            this.mediator.appendFlow('appengine-install-configs')
        else if (this.spec._ui.secrets)
            this.mediator.appendFlow('appengine-install-secrets')
        else
            this.mediator.appendFlow('appengine-install-finished')

        return true

    }



}
