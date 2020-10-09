
import { getLabels } from './labels'

export function getConfigTemplate(name: string, namespace: string) {

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}configs`,
            namespace: namespace,
            labels: getLabels(name)
        },
        data: {}
    }
}