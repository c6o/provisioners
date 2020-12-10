
import { StoreFlowMediator, StoreFlowStep } from '@provisioner/common'
import { LitElement } from 'lit-element'
import { AppEngineState, AppManifest, AppObject, Helper } from '../../appObject'


export class AppEngineBaseView extends LitElement implements StoreFlowStep {

    manifest: AppManifest
    mediator: StoreFlowMediator
    state: AppEngineState
    helper = new Helper()

    async init() {

        if(this.manifest === undefined)
            this.manifest = new AppObject(this.mediator.applicationSpec) as AppManifest

        if(this.state === undefined) {
        this.state = new AppEngineState(
            {
                name: this.manifest.name,
                appId: this.manifest.appId,
                partOf: this.manifest.appId,
                edition: this.manifest.edition
            })
        }
    }

}
