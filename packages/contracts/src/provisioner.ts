import { Cluster, Status } from '@c6o/kubeclient-contracts'
import { AppResource } from './app'
import { Resolver,  } from './resolver'

export interface IngressParameters {
    ip?: string
    hostname?: string
}

export interface Controller {
    readonly status?: Status
    readonly cluster: Cluster
    readonly resolver: Resolver
    readonly document?: AppResource

    /* @deprecated */
    readonly hubClient?
}
export interface ProvisionerBase {
    controller: Controller
    spec?: any
    serviceNamespace: string
    serviceName: string

    /** @deprecated */
    getIngressGatewayServiceClusterIp(): Promise<string>

    /** @deprecated */
    readFile(...args: string[]): Promise<string>

    providedDeprovisionOption(option, answers?)
    getDeprovisionOption(option, defaultValue, answers?)
    setDeprovisionOption(option, value)
}