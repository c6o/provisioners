import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface SelfSubjectAccessReview<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    apiVersion: 'authorization/v1'
    status: {
        allowed: boolean
        denied: boolean
        evaluationError: string
        reason: string
    }
}