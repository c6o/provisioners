
import { Cluster, Status, KubeObject, KubeDocument } from '@traxitt/kubeclient'
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
    toNamespaceObject(namespace) : KubeObject

    getProvisioner(serviceName: string): Promise<ProvisionerBase>

    getInstalledApps(appName: string): Promise<Array<KubeDocument>>
}