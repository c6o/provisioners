import { Namespace } from '@c6o/kubeclient-resources/core/v1'
import { setLabel } from '@c6o/kubeclient-contracts'
import { Labels } from '../labels'

export const toNamespace = (namespace: string | Namespace): Namespace => {
    if (!namespace) return

    return (typeof namespace === 'string') ? {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: namespace
        }
    } :
        namespace
}

export const toManagedNamespace = (namespace: string | Namespace, managedBy?: string) => {
    const resource = toNamespace(namespace)
    if (resource)
        return setLabel(toNamespace(namespace), Labels.K8SAppManagedBy, managedBy)
}