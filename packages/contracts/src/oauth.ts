import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export type OAuthStatus = 'Approved' | 'Denied' | 'Error'

export interface OAuth<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    apiVersion: 'system.codezero.io/v1'
    kind: 'OAuth'
    status?: OAuthStatus
}