import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface Secret<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    apiVersion: 'v1'
    data?: keyValue
    immutable?: boolean
}