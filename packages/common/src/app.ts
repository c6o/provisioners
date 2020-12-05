import { KubeDocument } from '@c6o/kubeclient'

export interface MenuItems {
    type: string,
    display: string
    action: string
}

export interface LaunchType {
    type?: string
    tag?: string
    api?: boolean
    path?: string
    popUp: boolean
    local?: {
        command: string
        args?: Array<string>
    }
}
export interface RoutesType {
    type: 'tcp' | 'http',
    targetService: string,
    targetPort?: number,
    disabled?: boolean
    http?: {
        prefix?: string,
        rewrite?: string
    },
    tcp?: {
        port?: number,
        name: string,
        strictPort?: boolean
    }
}
export interface ServicesType {
    // open
    [key: string]: any
}

export interface AppDocument extends KubeDocument {
    spec: {
        navstation?: boolean
        marina?: {
            launch?: LaunchType
            menus?: Array<MenuItems>
        }
        provisioner?: any | 'ignore'
        services?: ServicesType
        routes?: Array<RoutesType>
    }
}

export const AppStatuses = {
    create: {
        Pending: 'Installing',
        Completed: 'Running',
        Error: 'Error'
    },
    update: {
        Pending: 'Configuring',
        Completed: 'Running',
        Error: 'Degraded'
    },
    remove: {
        Pending: 'Terminating',
        Completed: 'Terminated',
        Error: 'Degraded'
    }
}

// TODO add status: ...(list) and use this for validation

export class AppObject {

    _services

    get services() {
        if (this._services)
            return this._services

        // ensure we always have a provisioner section, otherwise provisioners will not save changes
        // when remote provisioning
        this.document.spec.provisioner = this.document.spec.provisioner || {}

        // do not copy - provisioners -- modify the document service spec directly
        const appProvisioner: string = this.document.spec.provisioner.name || this.document.metadata.name
        const services = this.document.spec.provisioner?.services || []

        return this._services = [
            ...services,
            { [appProvisioner]: this.document.spec.provisioner }
        ]
    }

    get serviceNames() {
        return this.services.map(serviceObject => this.getServiceName(serviceObject))
    }

    get isNew() {
        return !!this.document.metadata.uid
    }

    constructor(public document) { }

    getAppEdition() {
        return this.document.metadata.labels?.['system.codezero.io/edition'] || 'latest'
    }

    getAppName() {
        return this.document.metadata.name
    }

    getAppNamespace() {
        return this.document.metadata.namespace
    }

    // spec is the contents of the service object
    getServiceSpec(serviceName: string) {
        return this.getServiceObject(serviceName)[serviceName]
    }

    getServicePackage(serviceName: string) {
        const serviceSpec = this.getServiceSpec(serviceName)
        return serviceSpec.package
    }

    getServiceTagPrefix(serviceName: string) {
        const serviceSpec = this.getServiceSpec(serviceName)
        return serviceSpec['tag-prefix'] || serviceName
    }

    // object is the object including the service name tag used by CLI to skip, etc.
    getServiceObject(serviceName: string) {
        return this.services.find(serviceObject => this.getServiceName(serviceObject) === serviceName) || {}
    }

    getServiceName = (serviceObject) => Object.keys(serviceObject)[0]

    //add or update the label
    upsertLabel(labelName: string, labelValue: string) {
        this.document.metadata.labels[labelName] = labelValue
    }

    //only add if it doesnt already exist
    insertOnlyLabel(labelName: string, labelValue: string) {
        if (!this.document.metadata.labels[labelName])
            this.document.metadata.labels[labelName] = labelValue
    }

}