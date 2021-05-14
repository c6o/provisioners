import { LitElement, html, customElement, property } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

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
                <c6o-checkbox
                    ?checked=${!!this.serviceSpec.simpleService}
                    theme="condensed"
                    @checked-changed=${this.checkHandler('simpleService')}
                >
                    Simple Prometheus Install
                </c6o-checkbox>
                <c6o-checkbox
                    ?checked=${!!this.serviceSpec.alertManagerEnabled}
                    ?disabled=${this.isSimple}
                    theme="condensed"
                    @checked-changed=${this.checkHandler('alertManagerEnabled')}
                >
                    Alert Manager
                </c6o-checkbox>
                <c6o-checkbox
                    ?checked=${!!this.serviceSpec.kubeMetricsEnabled}
                    ?disabled=${this.isSimple}
                    theme="condensed"
                    @checked-changed=${this.checkHandler('kubeMetricsEnabled')}
                >
                    Kube State Metrics
                </c6o-checkbox>
                <c6o-checkbox
                    ?checked=${!!this.serviceSpec.nodeExporterEnabled}
                    ?disabled=${this.isSimple}
                    theme="condensed"
                    @checked-changed=${this.checkHandler('nodeExporterEnabled')}
                >
                    Node Exporter
                </c6o-checkbox>
                <c6o-checkbox
                    ?checked=${!!this.serviceSpec.pushGatewayEnabled}
                    ?disabled=${this.isSimple}
                    theme="condensed"
                    @checked-changed=${this.checkHandler('pushGatewayEnabled')}
                >
                    Push Gateway
                </c6o-checkbox>
            </c6o-form-layout>
        `
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value
        this.isSimple = this.serviceSpec.simpleService
    }
}
