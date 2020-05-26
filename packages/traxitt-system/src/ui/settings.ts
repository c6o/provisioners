import { LitElement, html, customElement, property } from 'lit-element'
import { unlinkToken } from '../constants'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'
import { TextFieldElement } from '@vaadin/vaadin-text-field/src/vaadin-text-field'
import { AppStatuses } from '@provisioner/common/src/app'

@customElement('traxitt-system-settings-main')
export class TraxittSystemSettings extends LitElement {
    api

    @property({ type: String })
    loggingLink

    @property({ type: Object })
    loggerOptions

    @property({ type: Object })
    npmLink

    @property({ type: Object })
    npmOptions

    @property({ type: Object })
    prometheusLink

    @property({ type: Object })
    prometheusOptions

    @property({ type: Object })
    grafanaLink

    @property({ type: Object })
    grafanaOptions

    @property({ type: Boolean })
    busy

    @property({ type: Boolean })
    loaded = false

    choicesService
    disposer

    get loggerComboBox() { return this.shadowRoot.querySelector('#logger-combo-box') as ComboBoxElement }
    get npmComboBox() { return this.shadowRoot.querySelector('#npm-combo-box') as ComboBoxElement }
    get npmUsername() { return this.shadowRoot.querySelector('#npm-username') as TextFieldElement }
    get npmPassword() { return this.shadowRoot.querySelector('#npm-password') as TextFieldElement }
    get grafanaComboBox() { return this.shadowRoot.querySelector('#grafana-combo-box') as ComboBoxElement }
    get prometheusComboBox() { return this.shadowRoot.querySelector('#prometheus-combo-box') as ComboBoxElement }

    render() {
        if (!this.loaded)
            return html`Loading...`

        return html`
            ${this.renderNpmLink()}
            <hr />
            ${this.renderLoggingLink()}
            <hr />
            ${this.renderPrometheusLink()}
            <hr />
            ${this.renderGrafanaLink()}
            <br />
            <traxitt-button @click=${this.resetSettings} ?disabled=${this.busy}>Reset Changes</traxitt-button>
            <traxitt-button @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</traxitt-button>
            `
    }

    get npmOptionsList() {
        return this.npmOptions.map(option => option.name)
    }

    linkNpm = async () => {
        this.npmLink = this.npmOptions.find(option => option.name === this.npmComboBox.value)
        const npmLinkOption = this.npmOptions.find(option => option.name === this.npmComboBox.value)
        this.npmLink = {
            name: npmLinkOption.name,
            username: this.npmUsername.value,
            password: this.npmPassword.value
        }
    }

    unlinkNpm = async () => {
        this.npmLink = unlinkToken
    }

    renderNpmLink() {
        if (this.npmLink !== unlinkToken)
            return html`
                <traxitt-button @click=${this.unlinkNpm} ?disabled=${this.busy}>Unlink npm from ${this.npmLink.name}</traxitt-button>
            `

        return html`
            <traxitt-vertical-layout>
                <traxitt-combo-box id='npm-combo-box' label='Select NPM Registry' required value=${this.npmOptionsList[0]} .items=${this.npmOptionsList} ?disabled=${this.busy}></traxitt-combo-box>
                <traxitt-text-field id='npm-username' label="Registry username" autoselect required></traxitt-text-field>
                <vaadin-password-field id='npm-password' label="Registry password" autoselect required></vaadin-password-field>
                <traxitt-button @click=${this.linkNpm} ?disabled=${this.busy}>Link NPM Registry</traxitt-button>
            </traxitt-vertical-layout>`
    }

    renderLoggingLink() {
        if (this.loggingLink !== unlinkToken)
            return html`
                <traxitt-button @click=${this.unlinkLogger} ?disabled=${this.busy}>Unlink logger in ${this.loggingLink}</traxitt-button>
            `

        return html`
          <traxitt-combo-box id='logger-combo-box' label='Select Logger Installation' required value=${this.loggerOptions[0]} .items=${this.loggerOptions} ?disabled=${this.busy}></traxitt-combo-box>
          <traxitt-button @click=${this.linkLogger} ?disabled=${this.busy}>Link Logger</traxitt-button>
        `
    }

    renderPrometheusLink() {
        if (this.prometheusLink !== unlinkToken)
            return html`
            <traxitt-button @click=${this.unlinkPrometheus} ?disabled=${this.busy}>Unlink Prometheus in ${this.prometheusLink} for Metrics</traxitt-button>
          `

        return html`
          <traxitt-combo-box id='prometheus-combo-box' label='Select Prometheus for Metrics' required value=${this.prometheusOptions[0]} .items=${this.prometheusOptions} ?disabled=${this.busy}></traxitt-combo-box>
          <traxitt-button @click=${this.linkPrometheus} ?disabled=${this.busy}>Link Prometheus</traxitt-button>
        `
    }

    renderGrafanaLink() {
        if (this.grafanaLink !== unlinkToken)
            return html`
                <traxitt-button @click=${this.unlinkGrafana} ?disabled=${this.busy}>Unlink Grafana in ${this.grafanaLink} for Metrics</traxitt-button>
            `

        return html`
          <traxitt-combo-box id='grafana-combo-box' label='Select Grafana for Metrics' required value=${this.grafanaOptions[0]} .items=${this.grafanaOptions} ?disabled=${this.busy}></traxitt-combo-box>
          <traxitt-button @click=${this.linkGrafana} ?disabled=${this.busy}>Link Grafana</traxitt-button>
        `
    }

    linkLogger = async () => {
        this.loggingLink = this.loggerComboBox.value
    }

    unlinkLogger = async () => {
        this.loggingLink = unlinkToken
    }

    linkPrometheus = async () => {
        this.prometheusLink = this.prometheusComboBox.value
    }

    unlinkPrometheus = async () => {
        // we can't link grafana without prometheus
        this.prometheusLink = unlinkToken
        this.grafanaLink = unlinkToken
    }

    linkGrafana = async () => {
        this.grafanaLink = this.grafanaComboBox.value
    }

    unlinkGrafana = async () => {
        this.grafanaLink = unlinkToken
    }

    resetSettings = async () => {
        await this.renderSettings(this.api.manifest)
    }

    // TODO: can't import @provisioner/common
    isBusy = (manifest) => manifest.status !== AppStatuses.update.Completed && manifest.status !== AppStatuses.update.Error

    renderSettings = async (manifest) => {
        // TODO: Do something else if error
        if (manifest) {
            this.busy = this.isBusy(manifest)
            this.loggingLink = manifest.spec.provisioner?.['logging-link'] || unlinkToken
            this.npmLink = manifest.spec.provisioner?.['npm-link'] || unlinkToken
            this.prometheusLink = manifest.spec.provisioner?.['prometheus-link'] || unlinkToken
            this.grafanaLink = manifest.spec.provisioner?.['grafana-link'] || unlinkToken
        }

        const result = await this.choicesService.find({})
        this.loggerOptions = result.loggerOptions
        this.npmOptions = result.npmOptions
        this.prometheusOptions = result.prometheusOptions
        this.grafanaOptions = result.grafanaOptions
    }

    applyChanges = async (e) => {
        this.busy = true

        let encodedLink:any  = unlinkToken

        if (this.npmLink !== unlinkToken) {
            encodedLink = {
                name: this.npmLink.name,
                username: window.btoa(this.npmLink.username),
                password: window.btoa(this.npmLink.password)
            }
        }

        await this.api.patchManifest({
            spec: {
                provisioner: {
                    ...{['npm-link']: encodedLink},
                    ...{['logging-link']: this.loggingLink},
                    ...{['prometheus-link']: this.prometheusLink},
                    ...{['grafana-link']: this.grafanaLink}
                }
            }
        })
    }

    async connectedCallback() {
        super.connectedCallback()
        this.choicesService = this.api.createService('choices')
        this.api.watchManifest(this.renderSettings)
        await this.renderSettings(this.api.manifest)
        this.loaded = true
    }
}
