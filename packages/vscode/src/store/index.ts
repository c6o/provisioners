import { LitElement, html, customElement } from 'lit-element'

@customElement('vscode-capacity')
export class VSCodeCapacity extends LitElement {
    units = ['Ki','Mi','Gi','Ti','Pi','Ei']

    render() {
        return html`
            <traxitt-form-layout>
                <traxitt-combo-box @click=${this.clicked} label='Data Volume Size' required allow-custom-value></traxitt-combo-box>
                <traxitt-combo-box @selected-item-changed=${this.clicked} label='Data Volume Units' required value='Gi' .items=${this.units}></traxitt-combo-box>
            </traxitt-form-layout>
        `
    }

    clicked = (e) => {
        console.log('HELLO', e)
    }
}