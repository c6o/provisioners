import { keyValue } from '@c6o/kubeclient-contracts'

export function getSecretTemplate(name: string, namespace: string, data: keyValue) {

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: `${name}-secret`,
            namespace: namespace
        },
        type: 'Opaque',
        data
    }
}