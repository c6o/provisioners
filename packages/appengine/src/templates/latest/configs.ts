
import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getConfigTemplate(name: string, namespace: string, metaData: LabelsMetadata) {

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}configs`,
            namespace: namespace,
            labels: getLabels(name, metaData)
        },
        data: {}
    }
}