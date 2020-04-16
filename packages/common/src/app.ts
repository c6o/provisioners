import { KubeDocument, KubeObject } from '@traxitt/kubeclient'

interface menuItems  {
    type: string,
    display: string
    action: string
}

export interface AppDocument extends KubeDocument {
    navstation?: boolean
    marina?: {
        launch?: {
            type?: string
            port?: number
            tag?: string
            path?: string
            local?: {
                command: string
                args?: Array<string>
            }
        }
    }
    menus?: Array<menuItems>
    provisioner?: any | 'ignore'
}

// TODO add status: ...(list) and use this for validation

export class AppObject {

    constructor(public document) { }

    _services

    get services() {
        if (this._services)
            return this._services

        // ensure we always have a provisioner section, otherwise provisioners will not save changes
        // when remote provisioning
        this.document.provisioner = this.document.provisioner || {}

        // do not copy - provisioners -- modify the document service spec directly
        const appProvisioner: string = this.document.provisioner.name || this.document.metadata.name
        const services = this.document.provisioner?.services || []

        return this._services = [
            ...services,
            { [appProvisioner]: this.document.provisioner }
        ]
    }

    get serviceNames() {
        return this.services.map(serviceObject => this.getServiceName(serviceObject))
    }

    // spec is the contents of the service object
    getServiceSpec(serviceName : string) {
        return this.getServiceObject(serviceName)[serviceName]
    }

    // object is the object including the service name tag used by CLI to skip, etc.
    getServiceObject(serviceName : string) {
        return this.services.find(serviceObject => this.getServiceName(serviceObject) === serviceName) || {}
    }

    getServiceName = (serviceObject) => Object.keys(serviceObject)[0]
}