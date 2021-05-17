import { Resource, keyValue } from '@c6o/kubeclient-contracts'

export type OAuthStatus = 'Approved' | 'Denied' | 'Error'

export interface OAuth extends Resource {
    apiVersion: 'system.codezero.io/v1'
    kind: 'OAuth'
    status?: OAuthStatus
}