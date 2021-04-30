import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export type UserStatus = 'Approved' | 'Denied' | 'Error'

export interface User<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    apiVersion: 'system.codezero.io/v1'
    kind: 'User'

    status?: UserStatus
    credentials?: {
        privateKey?: string
        publicKey?: string
        certificate?: string
    }
}