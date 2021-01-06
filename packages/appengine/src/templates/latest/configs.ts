
import { LabelsMetadata } from '../../contracts'
import { getLabels } from './labels'

export function getConfigTemplate(name: string, namespace: string, metaData: LabelsMetadata) {

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: `${name}-config`,
            namespace: namespace,
            labels: getLabels(name, metaData)
        },
        data: {}
    }
}