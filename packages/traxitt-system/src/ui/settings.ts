import { LitElement, html, customElement, property } from 'lit-element'
import { unlinkToken } from '../constants'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'

@customElement('traxitt-system-settings-main')
export class TraxittSystemSettings extends LitElement {
    api

    @property({ type: Object })
    loggerDetails

    @property({ type: Object })
    loggerOptions

    @property({ type: Boolean })
    busy

    @property({ type: Boolean })
    loaded = false

    choicesService
    disposer

    get loggerComboBox() { return this.shadowRoot.querySelector('#logger-combo-box') as ComboBoxElement }

    render() {
        if (!this.loaded)
            return html`Loading...`

        return html`
            ${this.renderLoggingLink()}
            <hr />
            <traxitt-button class="pointer" @click=${this.resetSettings} ?disabled=${this.busy}>Reset Changes</traxitt-button>
            <traxitt-button class="pointer" @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</traxitt-button>
            `
    }

    renderLoggingLink() {
        if (this.loggerDetails !== unlinkToken)
            return html`
                <traxitt-button class="pointer" @click=${this.unlinkLogger} ?disabled=${this.busy}>Unlink logger in ${this.loggerDetails}</traxitt-button>
            `

        return html`
          <traxitt-combo-box id='logger-combo-box' label='Select Logger Installation' required value=${this.loggerOptions[0]} .items=${this.loggerOptions} ?disabled=${this.busy}></traxitt-combo-box>
          <traxitt-button class="pointer" @click=${this.linkLogger} ?disabled=${this.busy}>Link Logger</traxitt-button>
        `
    }

    linkLogger = async () => {
        this.loggerDetails = this.loggerComboBox.value
    }

    unlinkLogger = async () => {
        this.loggerDetails = unlinkToken
    }

    resetSettings = async () => {
        await this.renderSettings(this.api.manifest)
    }

    isBusy = (manifest) => manifest.status !== 'Running' && manifest.status !== 'Error'

    renderSettings = async (manifest) => {
        // TODO: Do something else if error
        if (manifest) {
            this.busy = this.isBusy(manifest)
            this.loggerDetails = manifest.spec.provisioner?.['logging-link'] || unlinkToken
        }

        const result = await this.choicesService.find({})
        this.loggerOptions = result.loggerOptions
    }

    applyChanges = async (e) => {
        this.busy = true
        await this.api.patchManifest({
            spec: {
                provisioner: {
                    ...{['logging-link']: this.loggerDetails }
                }
            }
        })
    }

    async connectedCallback() {
        super.connectedCallback()
        this.choicesService = this.api.createService('traxitt-system', 'choices')
        this.api.watchManifest(this.renderSettings)
        await this.renderSettings(this.api.manifest)
        this.loaded = true
    }
}
