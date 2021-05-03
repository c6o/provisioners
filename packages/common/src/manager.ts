
import { Cluster, ResourceHelper, Status } from '@c6o/kubeclient-contracts'
import { AppDocument } from '@provisioner/contracts'
import { ProvisionerBase } from './provisioner'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export interface ProvisionerManager {
    cluster: Cluster
    document: any
    state: any

    inquirer
    hubClient
    status: Status

    // namespace mixin
    toNamespaceObject(namespace) : ResourceHelper
    getProvisioner(appDoc: AppDocument, service?: string): Promise<ProvisionerBase>
    getInstalledServices(interfaceName): Promise<Array<AppDocument>>
    getAppProvisioner(appName: string, appNamespace: string): Promise<ProvisionerBase>
    getProvisionerModule(serviceName: string, npmPackage?:string ): Promise<ProvisionerBase>
    getInstalledApp(name: string, namespace: string ): Promise<AppDocument>
    getInstalledApps(appName: string): Promise<Array<AppDocument>>
}