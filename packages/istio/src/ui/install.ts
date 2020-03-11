import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('istio-install-main')
export class IstioSetup extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('istio')
    }

    render() {
        return html`
            <style>
                .form-group {
                    display: block;
                    padding-bottom: var(--lumo-space-m);
                }
            </style>

            <traxitt-form-layout>
                <div class="container">
                    <h4>Required Components:</h3>

                    <div class="form-group">
                        <traxitt-checkbox checked disabled>
                            Istio Base (CRDs)
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox checked disabled>
                            Gateway (Ingress)
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox checked disabled>
                            Pilot (Traffic Management)
                        </traxitt-checkbox>
                    </div>
                </div>

                <div class="container">
                    <h4>Optional Components:</h3>

                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.autoInjectCheckChanged} ?checked=${this.serviceSpec.autoInjectEnabled}>
                            Auto Injection
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.citadelCheckChanged} ?checked=${this.serviceSpec.citadelEnabled}>
                            Citadel (Authentication and Identity)
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.coreDnsCheckChanged} ?checked=${this.serviceSpec.coreDnsEnabled}>
                            Core DNS
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.galleyCheckChanged} ?checked=${this.serviceSpec.galleyEnabled}>
                            Galley (Configuration)
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.policyCheckChanged} ?checked=${this.serviceSpec.policyEnabled}>
                            Policy
                        </traxitt-checkbox>
                    </div>
                    <div class="form-group">
                        <traxitt-checkbox @checked-changed=${this.telemetryCheckChanged} ?checked=${this.serviceSpec.telemetryEnabled}>
                            Telemetry (Analytics)
                        </traxitt-checkbox>
                    </div>
                </div>
            </traxitt-form-layout>
        `
    }

    autoInjectCheckChanged = (e) => {
        this.serviceSpec.autoInjectEnabled = e.detail.value
    }

    citadelCheckChanged = (e) => {
        this.serviceSpec.citadelEnabled = e.detail.value
    }

    coreDnsCheckChanged = (e) => {
        this.serviceSpec.coreDnsEnabled = e.detail.value
    }

    galleyCheckChanged = (e) => {
        this.serviceSpec.galleyEnabled = e.detail.value
    }

    policyCheckChanged = (e) => {
        this.serviceSpec.policyEnabled = e.detail.value
    }

    telemetryCheckChanged = (e) => {
        this.serviceSpec.telemetryEnabled = e.detail.value
    }
}