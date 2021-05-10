import { EventEmitter } from 'events'
import { Namespace } from '@c6o/kubeclient-resources/core/v1'
import { Cluster, Resource, Status } from '@c6o/kubeclient-contracts'
import { AppDocument } from './app'
import { ProvisionerBase } from './provisioner'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export type actionType = 'create' | 'update' | 'remove'
export type stageType = 'load' | 'inquire' | 'validate' | 'apply' | 'done'
export type transactionStateType = 'pending' | 'completed' | 'error'

/*export interface ProvisionerManager extends EventEmitter {
    cluster: Cluster
    document: Resource

    inquirer
    hubClient
    status: Status
}*/

export interface Resolver {
    getProvisioner<T extends ProvisionerBase>(appDoc: AppDocument, service?: string): Promise<T>
    getAppProvisioner<T extends ProvisionerBase>(appName: string, appNamespace: string): Promise<T>
    getProvisionerModule<T extends ProvisionerBase>(serviceName: string, npmPackage?:string ): Promise<T>
    getInstalledServices(interfaceName): Promise<Array<AppDocument>>
    getInstalledApp(name: string, namespace: string ): Promise<AppDocument>
    getInstalledApps(appName: string): Promise<Array<AppDocument>>
}

/*export interface Supervisor {
    // status: Status
    // cluster: Cluster
    // resolver: Resolver

    // Remove the following
    inquirer
    hubClient

    document: AppDocument
    namespace?: Namespace
}*/