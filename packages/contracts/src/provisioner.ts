import { Cluster, Status } from '@c6o/kubeclient-contracts'
import { AppDocument } from './app'
import { Resolver,  } from './resolver'

export interface IngressParameters {
    ip?: string
    hostname?: string
}
export interface ProvisionerBase {
    cluster: Cluster
    status: Status
    resolver: Resolver

    /* @deprecated */
    hubClient

    document: AppDocument
    spec?: any
    serviceName: string

    /** @deprecated */
    getIngressGatewayServiceClusterIp(): Promise<string>

    /** @deprecated */
    readFile(...args: string[]): Promise<string>

    serviceNamespace: string

    ensureServiceNamespacesExist() : Promise<void>

    providedDeprovisionOption(option, answers?)
    getDeprovisionOption(option, defaultValue, answers?)
    setDeprovisionOption(option, value)
}