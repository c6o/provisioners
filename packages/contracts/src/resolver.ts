import { AppResource } from './app'
import { ProvisionerBase } from './provisioner'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export type actionType = 'create' | 'update' | 'remove'
export type stageType = 'load' | 'inquire' | 'validate' | 'apply' | 'done'
export type transactionStateType = 'pending' | 'completed' | 'error'
export interface Resolver {
    getProvisioner<T extends ProvisionerBase>(appResource: AppResource, serviceName?: string): Promise<T>
    getAppProvisioner<T extends ProvisionerBase>(name: string, namespace: string): Promise<T>
    getInstalledServices(interfaceName): Promise<Array<AppResource>>
    getInstalledApp(name: string, namespace: string ): Promise<AppResource>
    getInstalledApps(name: string): Promise<Array<AppResource>>
}