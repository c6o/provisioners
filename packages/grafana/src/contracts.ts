import { ConfigMap } from '@c6o/kubeclient-resources/core/v1';
import { ProvisionerBase } from '@provisioner/contracts'

export interface GrafanaProvisioner extends ProvisionerBase {
    beginConfig(namespace: string, appNamespace: string, appName: string): Promise<void>
    clearConfig(namespace: string, appNamespace: string, appName: string): Promise<void>
    endConfig(): Promise<void>

    addDataSource(name: string, spec): Promise<string>
    removeDataSource(name: string): Promise<void>

    dashboardConfigMap(namespace: string): ConfigMap
}