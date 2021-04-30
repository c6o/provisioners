import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface CertificateSigningRequest<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    apiVersion: 'certificates.k8s.io/v1beta1'
    status: {
        certificate?: string
        conditions?: {
            /**
             * timestamp for the last update to this condition
             */
            lastUpdateTime?: Date
            /**
             * human readable message with details about the request state
             */
            message?: string
            /**
             * brief reason for the request state
             */
            reason?: string
            /**
             * request approval state, currently Approved or Denied.
             */
            type: 'Approved' | 'Denied'
        }
    }
}