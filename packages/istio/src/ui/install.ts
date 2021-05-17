import { LitElement, html, customElement, CSSResult } from 'lit-element'
import { TextFieldElement } from '@vaadin/vaadin-text-field/src/vaadin-text-field'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/contracts'

@customElement('istio-install-main')
export class IstioSetup extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    get serviceSpec() { return this.mediator.getServiceSpec('istio') }
    get domainField() { return this.shadowRoot.getElementById('domain-name') as TextFieldElement }
    get hostnameField() { return this.shadowRoot.getElementById('hostname') as TextFieldElement }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-text-field
                    autoselect
                    id="domain-name"
                    label="Domain Name"
                    error-message="Please enter a domain name"
                    required
                    theme="condensed"
                    value=${this.serviceSpec.domainName || ''}
                    @input=${this.updateHandler('domainName')}
                ></c6o-text-field>
                <c6o-text-field
                    autoselect
                    id="hostname"
                    label="Hostname"
                    error-message="Please enter a hostname"
                    required
                    theme="condensed"
                    value=${this.serviceSpec.hostName || ''}
                    @input=${this.updateHandler('hostName')}
                ></c6o-text-field>
            </c6o-form-layout>

            <hr />

            <section c6o="grid 6">
                <c6o-form-layout>
                    <h3>Optional Components:</h3>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.httpsRedirect}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('httpsRedirect')}
                    >
                        Enable https redirect
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.autoInjectEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('autoInjectEnabled')}
                    >
                        Auto Injection
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.citadelEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('citadelEnabled')}
                    >
                        Citadel (Authentication and Identity)
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.coreDnsEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('coreDnsEnabled')}
                    >
                        Core DNS
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.galleyEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('galleyEnabled')}
                    >
                        Galley (Configuration)
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.policyEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('policyEnabled')}
                    >
                        Policy
                    </c6o-checkbox>
                    <c6o-checkbox
                        ?checked=${this.serviceSpec.telemetryEnabled}
                        theme="condensed"
                        @checked-changed=${this.updateHandler('telemetryEnabled')}
                    >
                        Telemetry (Analytics)
                    </c6o-checkbox>
                </c6o-form-layout>
                <div id="required-components">
                    <h3>Required Components:</h3>
                    <p class="help-text">
                        The following Istio dependencies will be included in the installation:
                    </p>
                    <ul>
                        <li>Istio Base (CRDs)</li>
                        <li>Gateway (Ingress)</li>
                        <li>Pilot (Traffic Management)</li>
                    </ul>
                </div>
            </section>
        `
    }

    updateHandler = (field) => (e) => {
        this.serviceSpec[field] = e.detail.value || e.target.value
    }

    isValid = async () => {
        await window.customElements.whenDefined('c6o-text-field')
        if (!this.domainField.value.length) {
            this.domainField.invalid = true
            this.domainField.errorMessage = 'Please enter a domain name'
            return false
        }
        if (!this.hostnameField.value.length) {
            this.hostnameField.invalid = true
            this.hostnameField.errorMessage = 'Please enter a hostname'
            return false
        }
        this.domainField.invalid = this.hostnameField.invalid = false
        this.domainField.errorMessage = this.hostnameField.errorMessage = ''
        return true
    }

    async end() {
        if (await this.isValid()) { return true }
        return false
    }
}