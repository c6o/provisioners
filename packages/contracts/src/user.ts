import { Resource } from '@c6o/kubeclient-contracts'

export type UserStatus = 'Approved' | 'Denied' | 'Error' | 'Generating' | 'Pending'

export interface User extends Resource {
    apiVersion: 'system.codezero.io/v1'
    kind: 'User'

    status?: UserStatus
    credentials?: {
        privateKey?: string
        publicKey?: string
        certificate?: string
    }
}