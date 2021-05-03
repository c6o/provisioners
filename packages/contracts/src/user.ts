import { KubeDocument } from '@c6o/kubeclient-contracts'

export type UserStatus = 'Approved' | 'Denied' | 'Error'

export interface User extends KubeDocument {
    apiVersion: 'system.codezero.io/v1'
    kind: 'User'

    status?: UserStatus
    credentials?: {
        privateKey?: string
        publicKey?: string
        certificate?: string
    }
}