import { Result } from '@c6o/kubeclient-contracts'
import { ProvisionerBase, IngressParameters, AppResource } from '@provisioner/contracts'

export interface IstioProvisioner extends ProvisionerBase {
    upsertVirtualService(app: AppResource, gateway: string): Promise<Result>
    removeVirtualService(app: AppResource): Promise<void>
    getApplicationPrefix(appName: string, namespace: string): string
    // clearConfig

    createGateway(namespace: string, name: string, servers?): Promise<Result>
    removeGateway(namespace: string, name: string): Promise<Result>
    getExternalAddress(): Promise<IngressParameters>
    setHttpsRedirect(enable: boolean): Promise<Result>
}