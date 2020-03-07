import { LitElement, html, customElement, property } from 'lit-element'

@customElement('istio-settings-main')
export class IstioSettings extends LitElement {
    api

    @property({type: Object})
    grafanaNamespace

    @property({type: Object})
    grafanaOptions

    @property({type: Boolean})
    busy

    service

    get grafanaComboBox() { return this.shadowRoot.querySelector('traxitt-combo-box') as unknown as any }

    render() {
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

    grafanaSelected = (e) => {
        this.grafanaNamespace = e.detail.value
    }

    unlinkGrafana = async (e) => {
        this.busy = true
        await this.service.remove(this.grafanaNamespace)
        await this.refreshLinkStatus()
        this.busy = false
    }

    linkGrafana = async (e) => {
        this.busy = true
        await this.service.create({namespace: this.grafanaNamespace})
        await this.refreshLinkStatus()
        this.busy = false
    }

    async connectedCallback() {
        super.connectedCallback()

        this.service = this.api.createService('istio', 'grafana-link')
        this.service.on('grafana-link', async (data) => {
            await this.refreshLinkStatus()
        })

        await this.refreshLinkStatus()
    }

    async refreshLinkStatus() {
        const result = await this.service.find({})
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
}