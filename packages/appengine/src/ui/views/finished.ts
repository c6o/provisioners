import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('appengine-install-finished')
export class AppEngineFinishedSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get spec() {
        return this.mediator.getServiceSpec(this.mediator.applicationSpec.metadata.name)
    }


    get appEngineSpec() {
        return this.mediator.getServiceSpec('appengine')
    }

    render() {
        return html`
        <h3>Finished!</h3>
        <p>Your installation of ${this.spec.metaData.display} will be started immediately.</p>
        <br />
        <br />
        <table width='100%'>
        <tr><td align='right'><p>Press 'Next' to finalize the installation.</p></td></tr>
        </table>
    `
    }

    async begin() {

        console.log(this.spec.name, this.spec)
        this.requestUpdate()

    }


    async end() {

        return true
    }

}