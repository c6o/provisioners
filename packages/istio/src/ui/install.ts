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

                traxitt-horizontal-layout > traxitt-form-layout:first-child {
                    padding-right: 15px;
                }

                .select-components-container {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid var(--lumo-shade-10pct);
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
                    <traxitt-text-field @input=${this.updateHandler('domainName')} label="Domain Name" value=${this.serviceSpec.domainName || ''} autoselect required></traxitt-text-field>
                </traxitt-form-layout>
                <traxitt-form-layout>
                    <traxitt-text-field @input=${this.updateHandler('hostName')} label="Hostname" value=${this.serviceSpec.hostName || ''} autoselect required></traxitt-text-field>
                </traxitt-form-layout>
            </traxitt-horizontal-layout>

            <traxitt-horizontal-layout class="select-components-container">
                <traxitt-form-layout>
                    <h3>Optional Components:</h3>
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
                </traxitt-form-layout>
                <traxitt-form-layout>
                    <h3>Required Components:</h3>
                    <p class="help-text">
                        The following Istio dependencies will be included in the installation:
                    </p>
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