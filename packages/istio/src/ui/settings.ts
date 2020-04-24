import { LitElement, html, customElement, property } from 'lit-element'
import { unlinkToken } from '../constants'

@customElement('istio-settings-main')
export class IstioSettings extends LitElement {
    api

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

    choicesService
    disposer

    get grafanaComboBox() { return this.shadowRoot.querySelector('#grafana-combo-box') as unknown as any }
    get prometheusComboBox() { return this.shadowRoot.querySelector('#prometheus-combo-box') as unknown as any }

    render() {
        if (!this.loaded)
            return html`Loading...`

        return html`
            ${this.renderGrafanaLink()}
            <hr />
            ${this.renderPrometheusLink()}
            <hr />
            <traxitt-checkbox @checked-changed=${this.httpsRedirectChanged} ?disabled=${this.busy} ?checked=${this.httpsRedirect}>Enable https redirect</traxitt-checkbox>
            <traxitt-button @click=${this.renderSettings} ?disabled=${this.busy}>Reset Changes</traxitt-button>
            <traxitt-button @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</traxitt-button>
            `
    }

    renderGrafanaLink() {
        if (this.grafanaNamespace)
            return html`
            <traxitt-button @click=${this.unlinkGrafana} ?disabled=${this.busy}>Unlink Grafana in ${this.grafanaNamespace}</traxitt-button>
          `
        return html`
            <traxitt-combo-box id='grafana-combo-box' @selected-item-changed=${this.linkGrafana} label='Select Grafana Installation' required value=${this.grafanaOptions[0]} .items=${this.grafanaOptions} ?disabled=${this.busy}></traxitt-combo-box>
            <traxitt-button @click=${this.linkGrafana} ?disabled=${this.busy}>Link Grafana</traxitt-button>
        `
    }

    renderPrometheusLink() {
        if (this.prometheusNamespace)
            return html`
            <traxitt-button id='grafana-combo-box' @click=${this.unlinkPrometheus} ?disabled=${this.busy}>Unlink Prometheus in ${this.prometheusNamespace}</traxitt-button>
          `

        return html`
          <traxitt-combo-box id='prometheus-combo-box' label='Select Prometheus Installation' required value=${this.prometheusOptions[0]} .items=${this.prometheusOptions} ?disabled=${this.busy}></traxitt-combo-box>
          <traxitt-button @click=${this.linkPrometheus} ?disabled=${this.busy}>Link Prometheus</traxitt-button>
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
        this.prometheusNamespace = unlinkToken
    }

    renderSettings = async (manifest) => {
        // TODO: Do something else if error
        if (manifest) {
            this.busy = manifest.status !== 'Running' && manifest.status !== 'Error'
            this.grafanaNamespace = manifest.provisioner?.['grafana-link'] !== unlinkToken ? manifest.provisioner?.['grafana-link'] : null
            this.prometheusNamespace = manifest.provisioner?.['prometheus-link'] !== unlinkToken ? manifest.provisioner?.['prometheus-link'] : null
            this.httpsRedirect = !!manifest.provisioner?.httpsRedirect
        }

        const result = await this.choicesService.find({})
        this.prometheusOptions = result.prometheusOptions
        this.grafanaOptions = result.grafanaOptions
    }

    applyChanges = async (e) => {

        this.busy = true
        //await this.api.updateManifest()
        await this.api.patchManifest({
            provisioner: {
                ...{['grafana-link']: this.grafanaNamespace},
                ...{['prometheus-link']: this.prometheusNamespace},
                ...{httpsRedirect: this.httpsRedirect}
            }
        })
        this.busy = false
    }


    async connectedCallback() {
        super.connectedCallback()

        this.choicesService = this.api.createService('istio', 'choices')

        this.api.watchManifest(this.renderSettings)

        await this.renderSettings(this.api.manifest)

        this.loaded = true
    }
}