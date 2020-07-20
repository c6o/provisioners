import { LitElement, html, customElement, property, css } from 'lit-element'
import { unlinkToken } from '../constants'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'

@customElement('istio-settings-main')
export class IstioSettings extends LitElement {
    api
    choicesService
    disposer

    @property({ type: Object })
    grafanaNamespace

    @property({ type: Object })
    grafanaOptions

    @property({ type: Object })
    prometheusNamespace

    @property({ type: Object })
    prometheusOptions

    @property({ type: Boolean })
    httpsRedirect: boolean

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
            }
        `
    }

    get grafanaComboBox() { return this.shadowRoot.querySelector('#grafana-combo-box') as ComboBoxElement }
    get prometheusComboBox() { return this.shadowRoot.querySelector('#prometheus-combo-box') as ComboBoxElement }

    render() {
        if (!this.loaded)
            return html`<c6o-loading></c6o-loading>`

        return html`
            <div id="prometheus">
                ${this.renderPrometheusLink()}
            </div>
            <div id="grafana">
                ${this.renderGrafanaLink()}
            </div>
            <c6o-checkbox
                @checked-changed=${this.httpsRedirectChanged}
                ?disabled=${this.busy}
                ?checked=${this.httpsRedirect}>
                Enable https redirect
            </c6o-checkbox>
            <div class="btn-footer">
                <c6o-button theme="default" @click=${this.resetSettings} ?disabled=${this.busy}>Reset Changes</c6o-button>
                <c6o-button theme="primary" @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</c6o-button>
            </div>
        `
    }

    renderGrafanaLink() {
        if (this.grafanaNamespace !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkGrafana}
                    ?disabled=${this.busy}>
                    Unlink Grafana in ${this.grafanaNamespace}
                </c6o-button>
            `

        return html`
            <c6o-combo-box
                id='grafana-combo-box'
                label='Select Grafana Installation'
                required
                value=${this.grafanaOptions[0]}
                .items=${this.grafanaOptions}
                ?disabled=${this.busy || this.prometheusNamespace === unlinkToken }
            ></c6o-combo-box>
            <c6o-button
                class="inline"
                @click=${this.linkGrafana}
                ?disabled=${this.busy || this.prometheusNamespace === unlinkToken}>
                Link Grafana
            </c6o-button>
        `
    }

    renderPrometheusLink() {
        if (this.prometheusNamespace !== unlinkToken)
            return html`
                <c6o-button
                    class="form-row"
                    @click=${this.unlinkPrometheus}
                    ?disabled=${this.busy}>
                    Unlink Prometheus in ${this.prometheusNamespace}
                </c6o-button>
            `

        return html`
            <c6o-combo-box
                id='prometheus-combo-box'
                label='Select Prometheus Installation'
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

    httpsRedirectChanged = async (e) => {
        this.httpsRedirect = e.detail.value
    }

    linkGrafana = async () => {
        this.grafanaNamespace = this.grafanaComboBox.value
    }

    linkPrometheus = async () => {
        this.prometheusNamespace = this.prometheusComboBox.value
    }

    unlinkGrafana = async () => {
        this.grafanaNamespace = unlinkToken
    }

    unlinkPrometheus = async () => {
        // we can't link grafana without prometheus
        this.prometheusNamespace = unlinkToken
        this.grafanaNamespace = unlinkToken
    }

    resetSettings = async () => {
        await this.renderSettings(this.api.manifest)
    }

    isBusy = (manifest) => manifest.status !== 'Running' && manifest.status !== 'Error'

    renderSettings = async (manifest) => {
        // TODO: Do something else if error
        if (manifest) {
            this.busy = this.isBusy(manifest)
            this.grafanaNamespace = manifest.spec.provisioner?.['grafana-link'] || unlinkToken
            this.prometheusNamespace = manifest.spec.provisioner?.['prometheus-link'] || unlinkToken
            this.httpsRedirect = !!manifest.spec.provisioner?.httpsRedirect
        }
        const result = await this.choicesService.find({})
        this.prometheusOptions = result.prometheusOptions
        this.grafanaOptions = result.grafanaOptions
    }

    applyChanges = async (e) => {
        this.busy = true
        await this.api.patchManifest({
            spec:{
                provisioner: {
                    ...{['grafana-link']: this.grafanaNamespace},
                    ...{['prometheus-link']: this.prometheusNamespace},
                    ...{httpsRedirect: this.httpsRedirect}
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