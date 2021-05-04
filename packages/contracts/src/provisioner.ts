import { Service } from '@c6o/kubeclient-resources/core/v1'
import { ProvisionerManager } from './manager'

export interface IngressParameters {
    ip?: string
    hostname?: string
}

export interface ProvisionerBase {
    spec?: any
    serviceName: string
    manager: ProvisionerManager

    getIngressGatewayServiceClusterIp(): Promise<string>
    restartDeployment(namespace: string, name: string): Promise<void>
    getServiceAddress(service: Service): Promise<IngressParameters>
}