import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'
import { customElement } from 'lit-element'
import { AppEngineBaseView } from './views/appEngineBaseView'

@customElement('appengine-uninstall-main')
export class UninstallVSCode extends AppEngineBaseView implements StoreFlowStep {

    mediator: StoreFlowMediator
    get serviceSpec() {
        return this.mediator.getServiceSpec('vscode')
    }

    async begin() {
        super.init()
        this.state.startTimer('ui-uninstall-begin')

        this.serviceSpec.deprovision = {
            'keep-ip': false,
            'keep-vol': true
        }

        this.state.endTimer('ui-uninstall-begin')

    }

    checkHandler = (field) => (e) => {
        this.serviceSpec.deprovision[field] = e.detail.value
    }
}