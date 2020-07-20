import { LitElement, html, customElement, property, css } from 'lit-element'
import { unlinkToken } from '../constants'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'
import { TextFieldElement } from '@vaadin/vaadin-text-field/src/vaadin-text-field'
import { AppStatuses } from '@provisioner/common/src/app'

@customElement('c6o-system-settings-main')
export class TraxittSystemSettings extends LitElement {
    api
    choicesService
    disposer

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

    static get styles() {
        return css`
            .inline {
                margin-left: 15px;
            }

            .btn-footer {
                border-top: 1px solid var(--color-wind);
                display: flex;
                justify-content: space-between;
                margin-top: var(--md-spacing);
                padding-top: var(--md-spacing);
            }

            .form-row {
                margin-bottom: var(--xl-spacing);
                width: auto !important;
            }

            hr {
                margin-bottom: var(--xl-spacing);
                border: 0;
                border-top: 1px solid var(--color-wind);
            }
        `
    }

    get loggerComboBox() { return this.shadowRoot.querySelector('#logger-combo-box') as ComboBoxElement }
    get npmComboBox() { return this.shadowRoot.querySelector('#npm-combo-box') as ComboBoxElement }
    get npmURL() { return this.shadowRoot.querySelector('#npm-url') as TextFieldElement }
    get npmUsername() { return this.shadowRoot.querySelector('#npm-username') as TextFieldElement }
    get npmPassword() { return this.shadowRoot.querySelector('#npm-password') as TextFieldElement }
    get grafanaComboBox() { return this.shadowRoot.querySelector('#grafana-combo-box') as ComboBoxElement }
    get prometheusComboBox() { return this.shadowRoot.querySelector('#prometheus-combo-box') as ComboBoxElement }

    render() {
        if (!this.loaded)
            return html`<c6o-loading></c6o-loading>`

        return html`
            <div id="npm">
                ${this.renderNpmLink()}
            </div>
            <hr />
            <div id="logging">
                ${this.renderLoggingLink()}
            </div>
            <div id="prometheus">
                ${this.renderPrometheusLink()}
            </div>
            <div id="grafana">
                ${this.renderGrafanaLink()}
            </div>
            <div class="btn-footer">
                <c6o-button theme="default" @click=${this.resetSettings} ?disabled=${this.busy}>Reset Changes</c6o-button>
                <c6o-button theme="primary" @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</c6o-button>
            </div>
        `
    }

    get npmOptionsList() {
        return this.npmOptions.map(option => option.name)
    }

    linkNpm = async () => {
        this.npmLink = this.npmOptions.find(option => option.name === this.npmComboBox.value)
        const npmLinkOption = this.npmOptions.find(option => option.name === this.npmComboBox.value)
        this.npmLink = npmLinkOption?.name ? {
            name: npmLinkOption.name,
            username: this.npmUsername.value,
            password: this.npmPassword.value
        } :
        this.npmURL.value ? {
            url: this.npmURL.value,
            username: this.npmUsername.value,
            password: this.npmPassword.value
        } :
        undefined
    }

    unlinkNpm = async () => {
        this.npmLink = unlinkToken
    }

    renderNpmLink() {
        if (this.npmLink !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkNpm}
                    ?disabled=${this.busy}>
                    Unlink npm from ${this.npmLink.name}
                </c6o-button>
            `

        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    id='npm-combo-box'
                    label='Select NPM Registry'
                    required
                    value=${this.npmOptionsList[0]}
                    .items=${this.npmOptionsList}
                    ?disabled=${this.busy}
                ></c6o-combo-box>
                <c6o-text-field id='npm-url' label="Registry URL" autoselect></c6o-text-field>
                <c6o-text-field id='npm-username' label="Registry username" autoselect required></c6o-text-field>
                <vaadin-password-field id='npm-password' label="Registry password" autoselect required></vaadin-password-field>
                <c6o-button
                    class="form-row"
                    @click=${this.linkNpm}
                    ?disabled=${this.busy}>
                    Link NPM Registry
                </c6o-button>
            </c6o-form-layout>
        `
    }

    renderLoggingLink() {
        if (this.loggingLink !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkLogger}
                    ?disabled=${this.busy}>Unlink logger in ${this.loggingLink}
                </c6o-button>
            `

        return html`
            <c6o-combo-box
                id='logger-combo-box'
                label='Select Logger Installation'
                required
                value=${this.loggerOptions[0]}
                .items=${this.loggerOptions}
                ?disabled=${this.busy}
            ></c6o-combo-box>
            <c6o-button
                class="inline"
                @click=${this.linkLogger}
                ?disabled=${this.busy}>
                Link Logger
            </c6o-button>
        `
    }

    renderPrometheusLink() {
        if (this.prometheusLink !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkPrometheus}
                    ?disabled=${this.busy}>
                    Unlink Prometheus in ${this.prometheusLink} for Metrics
                </c6o-button>
            `

        return html`
            <c6o-combo-box
                id='prometheus-combo-box'
                label='Select Prometheus for Metrics'
                required
                value=${this.prometheusOptions[0]}
                .items=${this.prometheusOptions}
                ?disabled=${this.busy}
            ></c6o-combo-box>
            <c6o-button
                class="inline"
                @click=${this.linkPrometheus}
                ?disabled=${this.busy}>
                Link Prometheus
            </c6o-button>
        `
    }

    renderGrafanaLink() {
        if (this.grafanaLink !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkGrafana}
                    ?disabled=${this.busy}>
                    Unlink Grafana in ${this.grafanaLink} for Metrics
                </c6o-button>
            `

        return html`
            <c6o-combo-box
                id='grafana-combo-box'
                label='Select Grafana for Metrics'
                required
                value=${this.grafanaOptions[0]}
                .items=${this.grafanaOptions}
                ?disabled=${this.busy}
            ></c6o-combo-box>
            <c6o-button
                class="inline"
                @click=${this.linkGrafana}
                ?disabled=${this.busy}>
                Link Grafana
            </c6o-button>
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

        let encodedLink: any = unlinkToken

        if (this.npmLink !== unlinkToken) {
            encodedLink = {
                ...{ name: this.npmLink.name },
                ...{ url: this.npmLink.url },
                ...{ username: this.npmLink.username?.length ? window.btoa(this.npmLink.username) : undefined } ,
                ...{ password: this.npmLink.password?.length ? window.btoa(this.npmLink.password) : undefined }
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
        await super.connectedCallback()

        this.choicesService = this.api.createService('choices')
        this.api.watchManifest(this.renderSettings)
        await this.renderSettings(this.api.manifest)
        this.loaded = true
    }
}
