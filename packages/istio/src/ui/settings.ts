import { LitElement, html, customElement, property } from 'lit-element'

@customElement('istio-settings-main')
export class IstioSettings extends LitElement {
    api

    @property({type: Object})
    grafanaNamespace

    @property({type: Object})
    grafanaOptions

    @property({type: Object})
    prometheusNamespace

    @property({type: Object})
    prometheusOptions

    @property({type: Boolean})
    httpRedirect

    @property({type: Boolean})
    busy

    @property({type: Boolean})
    loaded = false

    grafanaService
    prometheusService
    httpsRedirectService
    istioNamespace

    get grafanaComboBox() { return this.shadowRoot.querySelector('traxitt-combo-box') as unknown as any }

    render() {
        if (!this.loaded)
            return html `Loading...`

        return html `
            ${this.renderGrafanaLink()}
            <hr />
            ${this.renderPrometheusLink()}
            <hr />
            ${this.renderHttpsRefirect()}
        `
    }

    renderGrafanaLink() {
        if (this.grafanaOptions) {
            return html`
                <traxitt-combo-box @selected-item-changed=${this.grafanaSelected} label='Select Grafana Installation' required value=${this.grafanaOptions[0]} .items=${this.grafanaOptions} ?disabled=${this.busy}></traxitt-combo-box>
                <traxitt-button @click=${this.linkGrafana} ?disabled=${this.busy}>Link Grafana</traxitt-button>
            `
        }

        return html`
            <traxitt-button @click=${this.unlinkGrafana} ?disabled=${this.busy}>Unlink Grafana in ${this.grafanaNamespace}</traxitt-button>
        `
    }

    renderPrometheusLink() {
        if (this.prometheusOptions) {
            return html`
                <traxitt-combo-box @selected-item-changed=${this.prometheusSelected} label='Select Prometheus Installation' required value=${this.prometheusOptions[0]} .items=${this.prometheusOptions} ?disabled=${this.busy}></traxitt-combo-box>
                <traxitt-button @click=${this.linkPrometheus} ?disabled=${this.busy}>Link Prometheus</traxitt-button>
            `
        }

        return html`
            <traxitt-button @click=${this.unlinkPrometheus} ?disabled=${this.busy}>Unlink Prometheus in ${this.prometheusNamespace}</traxitt-button>
        `
    }

    renderHttpsRefirect() {
        return html`
            <traxitt-checkbox @checked-changed=${this.httpsRedirectChanged} ?disabled=${this.busy} ?checked=${this.httpRedirect}>Enable https redirect</traxitt-checkbox>
        `
    }

    grafanaSelected = (e) => {
        this.grafanaNamespace = e.detail.value
    }

    unlinkGrafana = async (e) => {
        this.busy = true
        await this.grafanaService.remove(this.grafanaNamespace)
        await this.refreshGrafanaLinkStatus()
        this.busy = false
    }

    linkGrafana = async (e) => {
        this.busy = true
        await this.grafanaService.create({istioNamespace: this.istioNamespace, namespace: this.grafanaNamespace})
        await this.refreshGrafanaLinkStatus()
        this.busy = false
    }

    async refreshGrafanaLinkStatus() {
        const result = await this.grafanaService.find({})
        if (result.choices) {
            this.grafanaOptions = result.choices
            this.grafanaNamespace = this.grafanaOptions[0]
        }
        else
            this.grafanaOptions = null

        if (result.namespace)
            this.grafanaNamespace = result.namespace
        else
            this.grafanaNamespace = null
    }


    prometheusSelected = (e) => {
        this.prometheusNamespace = e.detail.value
    }

    unlinkPrometheus = async (e) => {
        this.busy = true
        await this.prometheusService.remove(this.prometheusNamespace)
        await this.refreshPrometheusLinkStatus()
        this.busy = false
    }

    linkPrometheus = async (e) => {
        this.busy = true
        await this.prometheusService.create({istioNamespace: this.istioNamespace, namespace: this.prometheusNamespace})
        await this.refreshPrometheusLinkStatus()
        this.busy = false
    }

    async refreshPrometheusLinkStatus() {
        const result = await this.prometheusService.find({})
        if (result.choices) {
            this.prometheusOptions = result.choices
            this.prometheusNamespace = this.prometheusOptions[0]
        }
        else
            this.prometheusOptions = null

        if (result.namespace)
            this.prometheusNamespace = result.namespace
        else
            this.prometheusNamespace = null
    }


    httpsRedirectChanged = async (e) => {
        this.busy = true
        await this.httpsRedirectService.create({enable: e.detail.value})
        await this.refreshHttpRedirectStatus()
        this.busy = false
    }

    async refreshHttpRedirectStatus() {
        const result = await this.httpsRedirectService.find({})
        this.httpRedirect = result.enable
    }

    async connectedCallback() {
        super.connectedCallback()

        this.istioNamespace = this.api.manifest.metadata.namespace
        this.grafanaService = this.api.createService('istio', 'grafana-link')
        this.prometheusService = this.api.createService('istio', 'prometheus-link')
        this.httpsRedirectService = this.api.createService('istio','https-redirect')

        this.grafanaService.on('grafana-link', async (data) => {
            await this.refreshGrafanaLinkStatus()
        })

        this.prometheusService.on('prometheus-link', async (data) => {
            await this.refreshPrometheusLinkStatus()
        })

        await this.refreshGrafanaLinkStatus()
        await this.refreshPrometheusLinkStatus()
        await this.refreshHttpRedirectStatus()
        this.loaded = true
    }
}