import { ProvisionerBase, AppDocument } from '@provisioner/contracts'

export interface SystemProvisioner extends ProvisionerBase {

    postCreateApp(appSpec: AppDocument): Promise<void>
    postUpdateApp(appSpec: AppDocument): Promise<void>
    postRemoveApp(appSpec: AppDocument): Promise<void>
    getSystemFQDN(): Promise<string>
}