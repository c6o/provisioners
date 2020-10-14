import { getLabels } from './labels'


export function getSecretTemplate(name: string, namespace: string) {

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: `${name}secrets`,
            namespace: namespace,
            labels: getLabels(name)
        },
        type: 'Opaque',
        data: {}
    }
}