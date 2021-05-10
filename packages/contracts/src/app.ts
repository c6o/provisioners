import { Resource } from '@c6o/kubeclient-contracts'
import { CodeZeroHelper, CodeZeroLabels } from './codezero'

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
    [key: string]: any
}

export interface AppDocumentLabels extends CodeZeroLabels {
    'system.codezero.io/app': string
    'system.codezero.io/id': string
    'system.codezero.io/edition': string
    'app.kubernetes.io/name': string
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

export interface ServicePort {
    name?: string
    protocol: string
    port: number
    [key: string]: any
}

export interface Volume {
    name: string
    size: string
    mountPath: string
    subPath?: string
}

export type AppStatus = 'Installing' | 'Running' | 'Error' | 'Configuring' | 'Degraded' | 'Terminating' | 'Terminated'
export interface AppDocument extends Resource {
    labels?: AppDocumentLabels
    status?: AppStatus
    spec?: AppDocumentSpec
}

export const AppStatuses = {
    create: {
        Pending: 'Installing' as AppStatus,
        Completed: 'Running' as AppStatus,
        Error: 'Error' as AppStatus
    },
    update: {
        Pending: 'Configuring' as AppStatus,
        Completed: 'Running' as AppStatus,
        Error: 'Degraded' as AppStatus
    },
    remove: {
        Pending: 'Terminating' as AppStatus,
        Completed: 'Terminated' as AppStatus,
        Error: 'Degraded' as AppStatus
    }
}

export class AppObject<T extends AppDocument = AppDocument> extends CodeZeroHelper<T> {
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

    /** @todo This does not give you the app._id but the app.metadata.name and is expected to change */
    get appId() { return this.document.metadata.name }

    /** This can be used to fetch the resource from system server */
    get instanceId() { return `${this.namespace}-${this.name}` }

    get tag() { return this.document.spec.provisioner?.tag  }
    get description() { return this.document.metadata.annotations?.['system.codezero.io/description'] || this.appId }
    get edition() { return this.document.metadata.labels?.['system.codezero.io/edition'] || 'latest' }

    get provisioner() { return this.spec.provisioner }

    get routes() { return this.spec.routes }
    get hasRoutes() { return this.routes?.length }
    get httpRoute() { return this.routes?.find(item => item.type === 'http') }

    get spec() { return this.document.spec }

    /** @deprecated */
    get appEdition() { return this.edition }
    /** @deprecated */
    get appName() { return this.document.metadata.name }
    /** @deprecated */
    get appNamespace() { return this.document.metadata.namespace }

    get isNew() { return !!this.document.metadata.uid }

    get serviceNames() { return this.services.map(serviceObject => this.getServiceName(serviceObject)) }

    get componentLabels(): AppDocumentLabels {
        return {
            ...super.componentLabels,
            'system.codezero.io/app': this.name,
            'system.codezero.io/id': this.instanceId,
            'system.codezero.io/edition': this.edition,
            'app.kubernetes.io/name': this.name
        }
    }

    get appComponentMergeDocument() {
        return {
            metadata: {
                labels: this.componentLabels
            }
        }
    }

    get volumes(): Array<Volume> {
        return this.spec?.provisioner?.volumes
    }

    static volumesPath(): string {
        return '/spec/provisioner/volumes'
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

    //only add if it doesn't already exist
    insertOnlyLabel(labelName: string, labelValue: string) {
        if (!this.document.metadata.labels[labelName])
            this.document.metadata.labels[labelName] = labelValue
    }

}