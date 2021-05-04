import { ProvisionerBase } from '@provisioner/contracts'

export interface PrometheusProvisioner extends ProvisionerBase {
    beginConfig(namespace: string, clientNamespace: string, clientApp: string): Promise<void>
    clearAll(namespace: string, clientNamespace: string, clientApp: string): Promise<void>
    addJobs(jobs: Array<any>): Promise<void>
    endConfig(): Promise<void>
}