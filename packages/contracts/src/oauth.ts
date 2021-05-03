import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export type OAuthStatus = 'Approved' | 'Denied' | 'Error'

export interface OAuth extends KubeDocument {
    apiVersion: 'system.codezero.io/v1'
    kind: 'OAuth'
    status?: OAuthStatus
}