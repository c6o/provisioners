import { LitElement, html, customElement } from 'lit-element'
import { ComboBoxElement } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('mattermost-install-main')
export class MattermostSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    //these choices are based on the mattermost enterprise operator/deployment
    storageSizeChoices = ['2Gi', '5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    get serviceSpec() {
        return this.mediator.getServiceSpec('mattermost')
    }

    get userCountList() { return this.shadowRoot.getElementById('userCountList') as ComboBoxElement }
    get databaseSizeList() { return this.shadowRoot.getElementById('databaseSizeList') as ComboBoxElement }
    get minioSizeList() { return this.shadowRoot.getElementById('minioSizeList') as ComboBoxElement }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    error-message="Please select an expected number of users"
                    id="userCountList"
                    .items=${this.userCountChoices}
                    label="Expected users count (100)"
                    required
                    value="100"
                    @selected-item-changed=${this.usersSelected}
                ></c6o-combo-box>
                <c6o-text-field
                    colspan="2"
                    label="Mattermost license secret (optional)"
                    @change=${this.handleSearch}
                ></c6o-text-field>
                <c6o-combo-box
                    error-message="Please select a database size."
                    id="databaseSizeList"
                    .items=${this.storageSizeChoices}
                    label="Amount of storage for the database"
                    required
                    value="2Gi"
                    @selected-item-changed=${this.dbSizeSelected}
                ></c6o-combo-box>
                <c6o-combo-box
                    error-message="Please select an expected size."
                    id="minioSizeList"
                    .items=${this.storageSizeChoices}
                    label="Amount of storage for media files"
                    required
                    value="2Gi"
                    @selected-item-changed=${this.minioSizeSelected}
                ></c6o-combo-box>
        </c6o-form-layout>
        `
    }

    minioSizeSelected = (e) => {
        this.serviceSpec.minioStorageSize = e.detail.value
    }

    dbSizeSelected = (e) => {
        this.serviceSpec.databaseStorageSize = e.detail.value
    }

    usersSelected = (e) => {
        this.serviceSpec.users = e.detail.value
    }

    handleSearch = (e) => {
        this.serviceSpec.mattermostLicenseSecret = e.detail.value
    }

    async begin() {
        // set defaults
        const edition = this.mediator.applicationSpec.metadata.labels['system.codezero.io/edition']
        if (edition !== 'latest')
            throw new Error('Only the latest edition of Mattermost Provisioner allowed to pass')
        this.serviceSpec.edition = edition
    }

    async end() {
        let valid = true
        await window.customElements.whenDefined('c6o-combo-box')

        if (!this.serviceSpec.users) {
            this.userCountList.invalid = true
            valid = false
        }

        if (!this.serviceSpec.databaseStorageSize) {
            this.databaseSizeList.invalid = true
            valid = false
        }

        if (!this.serviceSpec.minioStorageSize) {
            this.minioSizeList.invalid = true
            valid = false
        }

        this.requestUpdate()
        return valid
    }
}