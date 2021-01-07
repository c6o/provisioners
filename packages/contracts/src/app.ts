import { KubeDocument, KubeObject, Metadata } from '@c6o/kubeclient-contracts'

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
    disabled?: boolean,

    /** Private routes are not exposed in the ingress gateway */
    private?: boolean,
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

//https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
export interface LabelsMetadata {
    name?: string
    appId?: string
    instanceId?: string
    partOf?: string
    component?: string
    version?: string
    edition?: string
    [key: string]: string
}

export interface AppDocumentSpec {
    navstation?: boolean
    marina?: {
        launch?: LaunchType
        menus?: Array<MenuItems>
    }
    provisioner?: any | 'ignore'
    services?: ServicesType
    routes?: Array<RoutesType>
}

export interface AppDocument extends KubeDocument {
    spec: AppDocumentSpec
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

export class AppObject extends KubeObject {
    _services

    get services() {
        if (this._services)
            return this._services

        // ensure we always have a provisioner section, otherwise provisioners will not save changes
        // when remote provisioning
        this.document.spec.provisioner = this.document.spec.provisioner || {}

        // do not copy - provisioners -- modify the document service spec directly
        const appProvisioner: string = this.document.metadata.name
        const services = this.document.spec.provisioner?.services || []

        return this._services = [
            ...services,
            { [appProvisioner]: this.document.spec.provisioner }
        ]
    }

    constructor(public document: AppDocument) {
        super(document)
    }

    /** @todo This does not give you the app._id but the app.metadata.name and is expected to change */
    get appId() { return this.document.metadata.name }

    /** This can be used to fetch the resource from system server */
    get instanceId() { return `${this.namespace}/${this.name}` }

    get name() { return this.document.metadata.name }
    get namespace() { return this.document.metadata.namespace }

    get tag() { return this.document.spec.provisioner?.tag  }
    get description() { return this.document.metadata.annotations?.['system.codezero.io/description'] || this.appId }
    get edition() { return this.document.metadata.labels?.['system.codezero.io/edition'] || 'latest' }
    get displayName() { return this.document.metadata.annotations?.['system.codezero.io/display'] || this.name }
    get iconUrl() { return this.document.metadata.annotations?.['system.codezero.io/iconUrl'] }

    get provisioner() { return this.spec.provisioner }
    get routes() { return this.spec.routes }
    get spec() { return this.document.spec }

    /** @deprecated */
    get appEdition() { return this.edition }
    /** @deprecated */
    get appName() { return this.document.metadata.name }
    /** @deprecated */
    get appNamespace() { return this.document.metadata.namespace }

    get isNew() { return !!this.document.metadata.uid }

    get serviceNames() { return this.services.map(serviceObject => this.getServiceName(serviceObject)) }

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

    //only add if it doesn't already exist
    insertOnlyLabel(labelName: string, labelValue: string) {
        if (!this.document.metadata.labels[labelName])
            this.document.metadata.labels[labelName] = labelValue
    }

}