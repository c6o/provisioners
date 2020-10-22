import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'


export function getSecretTemplate(name: string, namespace: string, metaData: LabelsMetadata) {

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: `${name}-secret`,
            namespace: namespace,
            labels: getLabels(name, metaData)
        },
        type: 'Opaque',
        data: {}
    }
}