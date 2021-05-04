import { EventEmitter } from 'events'
import { Cluster, Resource, ResourceHelper, Status } from '@c6o/kubeclient-contracts'
import { AppDocument } from './app'
import { ProvisionerBase } from './provisioner'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export interface ProvisionerManager extends EventEmitter {
    cluster: Cluster
    document: Resource
    state: any

    inquirer
    hubClient
    status: Status

    // namespace mixin
    toNamespaceObject(namespace) : ResourceHelper

    getProvisioner<T extends ProvisionerBase>(appDoc: AppDocument, service?: string): Promise<T>
    getAppProvisioner<T extends ProvisionerBase>(appName: string, appNamespace: string): Promise<T>
    getProvisionerModule<T extends ProvisionerBase>(serviceName: string, npmPackage?:string ): Promise<T>

    getInstalledServices(interfaceName): Promise<Array<AppDocument>>
    getInstalledApp(name: string, namespace: string ): Promise<AppDocument>
    getInstalledApps(appName: string): Promise<Array<AppDocument>>
}