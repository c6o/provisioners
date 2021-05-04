import { Service } from '@c6o/kubeclient-resources/core/v1'

export interface IngressParameters {
    ip?: string
    hostname?: string
}

export interface ProvisionerBase {
    getIngressGatewayServiceClusterIp(): Promise<string>
    restartDeployment(namespace: string, name: string): Promise<void>
    getServiceAddress(service: Service): Promise<IngressParameters>
}