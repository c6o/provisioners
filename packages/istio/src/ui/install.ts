import { LitElement, html, customElement, css } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('istio-install-main')
export class IstioSetup extends LitElement implements StoreFlowStep {

    static get styles() {
        return css`
            traxitt-horizontal-layout > traxitt-form-layout {
                flex-grow: 1;
                flex-basis: 0;
            }
        `
    }

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('istio')
    }

    render() {
        return html`
            <traxitt-horizontal-layout>
                <traxitt-form-layout>
                    <h4>Optional Components:</h4>
                    <traxitt-checkbox @change=${this.checkHandler('autoInjectEnabled')} ?checked=${this.serviceSpec.autoInjectEnabled}>
                        Auto Injection
                    </traxitt-checkbox>
                    <traxitt-checkbox @change=${this.checkHandler('citadelEnabled')} ?checked=${this.serviceSpec.citadelEnabled}>
                        Citadel (Authentication and Identity)
                    </traxitt-checkbox>
                    <traxitt-checkbox @change=${this.checkHandler('coreDnsEnabled')} ?checked=${this.serviceSpec.coreDnsEnabled}>
                        Core DNS
                    </traxitt-checkbox>
                    <traxitt-checkbox @change=${this.checkHandler('galleyEnabled')} ?checked=${this.serviceSpec.galleyEnabled}>
                        Galley (Configuration)
                    </traxitt-checkbox>
                    <traxitt-checkbox @change=${this.checkHandler('policyEnabled')} ?checked=${this.serviceSpec.policyEnabled}>
                        Policy
                    </traxitt-checkbox>
                    <traxitt-checkbox @change=${this.checkHandler('telemetryEnabled')} ?checked=${this.serviceSpec.telemetryEnabled}>
                        Telemetry (Analytics)
                    </traxitt-checkbox>
                </traxitt-form-layout>
                <traxitt-form-layout>
                    <h4>Required Components:</h4>
                    <ul>
                        <li>Istio Base (CRDs)</li>
                        <li>Gateway (Ingress)</li>
                        <li>Pilot (Traffic Management)</li>
                    </ul>
                </traxitt-form-layout>
            </traxitt-horizontal-layout>
        `
    }

    checkHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value
    }
}