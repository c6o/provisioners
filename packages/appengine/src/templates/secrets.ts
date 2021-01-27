import { keyValue } from '@provisioner/contracts'

export function getSecretTemplate(name: string, namespace: string, data: keyValue, labels?: keyValue ) {

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: `${name}-secret`,
            namespace: namespace,
            labels
        },
        type: 'Opaque',
        data
    }
}