import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('mattermost-install-main')
export class MattermostSettings extends LitElement implements StoreFlowStep {
    mediator: StoreFlowMediator

    storageSizeChoices = ['5Gi', '10Gi', '50Gi', '100Gi', '200Gi', '400Gi', '1000Gi']
    //these choices are based on the mattermost enterprise operator/deployment
    userCountChoices = [100, 1000, 5000, 10000, 25000]

    edition = 'latest'

    get serviceSpec() {
        return this.mediator.getServiceSpec('mattermost')
    }

    render() {
        return html`
            <c6o-form-layout>
                <c6o-combo-box
                    @selected-item-changed=${this.usersSelected}
                    error-message="Please select an expected number of users"
                    id="select-users"
                    value="100"
                    required
                    label="Expected users count (100)?"
                    .items=${this.userCountChoices}
                ></c6o-combo-box>

                <c6o-text-field
                    colspan="2"
                    id="license-secret"
                    label="Mattermost license secret:"
                    @change=${this.handleSearch}
                ></c6o-text-field>

                <c6o-combo-box
                    @selected-item-changed=${this.dbSizeSelected}
                    error-message="Please select an expected size."
                    value="5Gi"
                    required
                    id="select-db-size"
                    label="Amount of storage to provision for the database?"
                    .items=${this.storageSizeChoices}
                ></c6o-combo-box>

                <c6o-combo-box
                    @selected-item-changed=${this.minioSizeSelected}
                    error-message="Please select an expected size."
                    value="5Gi"
                    required
                    id="select-minio-size"
                    label="Amount of storage to provision for minio?"
                    .items=${this.storageSizeChoices}
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
        this.edition = this.mediator.applicationSpec.metadata.labels["system.codezero.io/edition"]
        if (this.edition !== 'latest') throw new Error("Only the latest edition of Mattermost Provisioner allowed to pass")
        this.serviceSpec.edition = this.edition
    }
}