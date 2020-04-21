import { LitElement, html, customElement, property } from 'lit-element'

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
            <traxitt-button @click=${this.resetChanges} ?disabled=${this.busy}>Reset Changes</traxitt-button>
            <traxitt-button @click=${this.applyChanges} ?disabled=${this.busy}>Apply Changes</traxitt-button>
            `
    }

    renderGrafanaLink() {
        if (this.grafanaNamespace)
            return html`
            <traxitt-button @click=${this.unlinkGrafana} ?disabled=${this.busy}>Unlink Grafana in ${this.grafanaNamespace}</traxitt-button>
          `
        return html`
            <traxitt-combo-box id='grafana-combo-box' @selected-item-changed=${this.grafanaSelected} label='Select Grafana Installation' required value=${this.grafanaOptions[0]} .items=${this.grafanaOptions} ?disabled=${this.busy}></traxitt-combo-box>
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
        this.grafanaNamespace = ''
    }

    unlinkPrometheus = async () => {
        this.prometheusNamespace = ''
    }

    resetChanges = () => {
        this.grafanaNamespace = this.api.manifest?.provisioner?.['grafana-link'] || null
        this.prometheusNamespace = this.api.manifest?.provisioner?.['prometheus-link'] || null
        this.httpsRedirect = !!this.api.manifest?.provisioner?.httpsRedirect
    }

    applyChanges = async (e) => {
        // copy state to manifest, remove status
        const manifest = this.api.manifest
            
        manifest.provisioner['grafana-link'] = this.grafanaNamespace || ''
        manifest.provisioner['prometheus-link'] = this.prometheusNamespace || ''
        manifest.provisioner.httpsRedirect = this.httpsRedirect

        this.busy = true
        await this.api.updateManifest()
        this.busy = false
    }

    async refreshChoices() {
        const result = await this.choicesService.find({})
        this.prometheusOptions = result.prometheusOptions
        this.grafanaOptions = result.grafanaOptions
    }

    async connectedCallback() {
        super.connectedCallback()

        this.choicesService = this.api.createService('istio', 'choices')

        this.resetChanges()

        await this.refreshChoices()
        this.loaded = true
    }
}