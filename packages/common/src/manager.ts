import { Status } from '@traxitt/common'
import {  Cluster, KubeObject } from '@traxitt/kubeclient'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export interface ProvisionerManager {
    cluster: Cluster
    applicationSpec: any

    inquirer
    status: Status

    // namespace mixin
    toNamespaceObject(namespace) : KubeObject
}