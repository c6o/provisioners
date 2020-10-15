
import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getPortTemplate(name: string, namespace: string, metaData: LabelsMetadata) {

    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: name,
            namespace: namespace,
            labels: getLabels(name, metaData)
        },
        spec: {
            type: 'NodePort',
            externalTrafficPolicy: 'Cluster',
            ports: [],
            selector: {
                app: name
            }
        }
    }
}