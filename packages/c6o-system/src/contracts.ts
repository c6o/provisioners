import { ProvisionerBase, AppResource } from '@provisioner/contracts'

export interface SystemProvisioner extends ProvisionerBase {

    postCreateApp(appSpec: AppResource): Promise<void>
    postUpdateApp(appSpec: AppResource): Promise<void>
    postRemoveApp(appSpec: AppResource): Promise<void>
    getSystemFQDN(): Promise<string>
}