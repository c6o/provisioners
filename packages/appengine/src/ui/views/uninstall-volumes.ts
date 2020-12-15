import { customElement, LitElement } from 'lit-element'
import { StoreFlowStep, StoreFlowMediator } from '@provisioner/common'


@customElement('appengine-uninstall-volumes')
export class UninstallVolumesViewSettings extends LitElement implements StoreFlowStep {

    mediator: StoreFlowMediator

    bodyLayout: any
    pageLayout: any

    get spec() {
        //return this.mediator.getServiceSpec('precog')
        return this.mediator.applicationSpec.spec.provisioner
    }

    render() {
        console.log('RENDERING UNINSTALL FOR VOLUMES')
        return this.pageLayout
    }

    async begin() {
        this.handleLayout()
    }

    handleLayout() {
        const headingLayout = document.createElement('h3')
        headingLayout.textContent = 'Volume Management'

        this.pageLayout = document.createElement('section')
        this.pageLayout.appendChild(headingLayout)

        this.bodyLayout = document.createElement('c6o-form-layout')
        this.pageLayout.appendChild(this.bodyLayout)

        this.requestUpdate()
    }
}