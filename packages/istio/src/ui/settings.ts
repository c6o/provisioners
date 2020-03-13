import { LitElement, html, customElement, property } from 'lit-element'

@customElement('istio-settings-main')
export class IstioSettings extends LitElement {
    api

    @property({type: Object})
    grafanaNamespace

    @property({type: Object})
    grafanaOptions

    @property({type: Boolean})
    httpRedirect

    @property({type: Boolean})
    busy

    @property({type: Boolean})
    loaded = false

    grafanaService
    httpsRedirectService

    get grafanaComboBox() { return this.shadowRoot.querySelector('traxitt-combo-box') as unknown as any }

    render() {
        if (!this.loaded)
            return html `Loading...`

        return html `
            ${this.renderGrafanaLink()}
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
        await this.refreshLinkStatus()
        this.busy = false
    }

    linkGrafana = async (e) => {
        this.busy = true
        await this.grafanaService.create({namespace: this.grafanaNamespace})
        await this.refreshLinkStatus()
        this.busy = false
    }

    httpsRedirectChanged = async (e) => {
        this.busy = true
        await this.httpsRedirectService.create({enable: e.detail.value})
        await this.refreshHttpRedirectStatus()
        this.busy = false
    }

    async refreshLinkStatus() {
        const result = await this.grafanaService.find({})
        if (result.choices) {
            this.grafanaOptions = result.choices
            this.grafanaNamespace = this.grafanaOptions[0]
        }
        else
            this.grafanaOptions = null

        if (result['grafana-namespace'])
            this.grafanaNamespace = result['grafana-namespace']
        else
            this.grafanaNamespace = null
    }

    async refreshHttpRedirectStatus() {
        const result = await this.httpsRedirectService.find({})
        this.httpRedirect = result.enable
    }

    async connectedCallback() {
        super.connectedCallback()

        this.grafanaService = this.api.createService('istio', 'grafana-link')
        this.httpsRedirectService = this.api.createService('istio','https-redirect')

        this.grafanaService.on('grafana-link', async (data) => {
            await this.refreshLinkStatus()
        })

        await this.refreshLinkStatus()
        await this.refreshHttpRedirectStatus()
        this.loaded = true
    }
}