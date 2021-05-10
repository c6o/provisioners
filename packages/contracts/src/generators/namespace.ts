import { Namespace } from '@c6o/kubeclient-resources/core/v1'
import { setManagedBy } from '../markers'

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
        return setManagedBy(toNamespace(namespace), managedBy)
}