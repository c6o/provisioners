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
            <c6o-form-layout>
                <c6o-checkbox @checked-changed=${this.checkHandler('simpleService')} ?checked=${!!this.serviceSpec.simpleService}>Simple Prometheus Install</c6o-checkbox>
                <br />
                <c6o-checkbox @checked-changed=${this.checkHandler('alertManagerEnabled')} ?checked=${!!this.serviceSpec.alertManagerEnabled} ?disabled=${this.isSimple}>Alert Manager</c6o-checkbox>
                <br />
                <c6o-checkbox @checked-changed=${this.checkHandler('kubeMetricsEnabled')} ?checked=${!!this.serviceSpec.kubeMetricsEnabled} ?disabled=${this.isSimple}>Kube State Metrics</c6o-checkbox>
                <br />
                <c6o-checkbox @checked-changed=${this.checkHandler('nodeExporterEnabled')} ?checked=${!!this.serviceSpec.nodeExporterEnabled} ?disabled=${this.isSimple}>Node Exporter</c6o-checkbox>
                <br />
                <c6o-checkbox @checked-changed=${this.checkHandler('pushGatewayEnabled')} ?checked=${!!this.serviceSpec.pushGatewayEnabled} ?disabled=${this.isSimple}>Push Gateway</c6o-checkbox>
            </c6o-form-layout>
        `
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value
        this.isSimple = this.serviceSpec.simpleService
    }
}
