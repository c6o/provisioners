
import { keyValue } from '@provisioner/appengine-contracts'

export function getConfigTemplate(name: string, namespace: string, data: keyValue, labels?: keyValue ) {

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}-config`,
            namespace: namespace,
            labels,
        },
        data
    }
}