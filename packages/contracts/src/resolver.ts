import { AppResource } from './app'
import { ProvisionerBase } from './provisioner'

export type optionFunctionType = (string, description: string, autocomplete?: ReadonlyArray<string>) => void

export type actionType = 'create' | 'update' | 'remove'
export type stageType = 'load' | 'inquire' | 'validate' | 'apply' | 'done'
export type transactionStateType = 'pending' | 'completed' | 'error'

export interface ResolverParams {
    appName: string
    namespace?: string
    serviceName?: string
    edition?: string
    hubToken?: string
}
export interface Resolver {
    getProvisioner<T extends ProvisionerBase>(params: ResolverParams): Promise<T>
    getProvisioner<T extends ProvisionerBase>(namespace: string, name: string): Promise<T>
    getProvisioner<T extends ProvisionerBase>(appResource: AppResource, serviceName?: string): Promise<T>
}