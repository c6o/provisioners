import { LitElement, html, customElement, property } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('prometheus-install-main')
export class PrometheusMainInstall extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('prometheus')
    }

    @property({type: Boolean})
    isSimple = false

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-checkbox @checked-changed=${this.checkHandler('simpleService')} ?checked=${!!this.serviceSpec.simpleService}>Simple Prometheus Install</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.checkHandler('alertManagerEnabled')} ?checked=${!!this.serviceSpec.alertManagerEnabled} ?disabled=${this.isSimple}>Alert Manager</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.checkHandler('kubeMetricsEnabled')} ?checked=${!!this.serviceSpec.kubeMetricsEnabled} ?disabled=${this.isSimple}>Kube State Metrics</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.checkHandler('nodeExporterEnabled')} ?checked=${!!this.serviceSpec.nodeExporterEnabled} ?disabled=${this.isSimple}>Node Exporter</traxitt-checkbox>
                <br />
                <traxitt-checkbox @checked-changed=${this.checkHandler('pushGatewayEnabled')} ?checked=${!!this.serviceSpec.pushGatewayEnabled} ?disabled=${this.isSimple}>Push Gateway</traxitt-checkbox>
            </traxitt-form-layout>
        `
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value
        this.isSimple = this.serviceSpec.simpleService
    }
}
