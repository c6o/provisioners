import { Cluster, Status, KubeObject } from '@traxitt/kubeclient'
import { ProvisionerBase } from './provisioner'
import { AppDocument } from './app'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export interface ProvisionerManager {
    cluster: Cluster
    document: any
    state: any

    inquirer
    hubClient
    status: Status

    // namespace mixin
    toNamespaceObject(namespace) : KubeObject

    getProvisioner(serviceName: string): Promise<ProvisionerBase>

    getInstalledApps(appName: string, appNamespace?: string): Promise<Array<AppDocument>>

    getInstalledServices(interfaceName): Promise<Array<AppDocument>>
}