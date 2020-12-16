import { LitElement, html, customElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'

@customElement('appengine-uninstall-main')
export class UninstallAppEngine extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    get serviceSpec() {
        return this.mediator.getServiceSpec('appengine')
    }

    // get spec() {
    //     rturn {} //this.mediator.applicationSpec.spec.provisioner
    // }

    render() {
        return html`hello world`
    //     <h3>Welcome to the ${this.spec.metaData.display} uninstaller.</h3>
    //     <br />
    //     <br />
    //     <table width='100%'>
    //     <tr><td align='right'><p>Press 'Next' to get started with the process.</p></td></tr>
    //     </table>
    // `
    }

    async begin() {
        console.log('ROBX', this.mediator)
    }
}