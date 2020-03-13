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
                    <traxitt-checkbox @checked-changed=${this.updateHandler('httpsRedirect')} ?checked=${this.serviceSpec.httpsRedirect}>
                        Enable https redirect
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('autoInjectEnabled')} ?checked=${this.serviceSpec.autoInjectEnabled}>
                        Auto Injection
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('citadelEnabled')} ?checked=${this.serviceSpec.citadelEnabled}>
                        Citadel (Authentication and Identity)
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('coreDnsEnabled')} ?checked=${this.serviceSpec.coreDnsEnabled}>
                        Core DNS
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('galleyEnabled')} ?checked=${this.serviceSpec.galleyEnabled}>
                        Galley (Configuration)
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('policyEnabled')} ?checked=${this.serviceSpec.policyEnabled}>
                        Policy
                    </traxitt-checkbox>
                    <traxitt-checkbox @checked-changed=${this.updateHandler('telemetryEnabled')} ?checked=${this.serviceSpec.telemetryEnabled}>
                        Telemetry (Analytics)
                    </traxitt-checkbox>
                    <traxitt-text-field @input=${this.updateHandler('domainName')} label="Domain Name" value=${this.serviceSpec.domainName || ''} autoselect required></traxitt-text-field>
                    <traxitt-text-field @input=${this.updateHandler('hostName')} label="Hostname" value=${this.serviceSpec.hostName || ''} autoselect required></traxitt-text-field>
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

    updateHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value || e.target.value
    }
}