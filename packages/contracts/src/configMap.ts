import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface ConfigMap<L extends keyValue = keyValue, A extends keyValue = keyValue, S = any> extends KubeDocument<L, A, S> {
    data?: keyValue
}