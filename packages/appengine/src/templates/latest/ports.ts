
import { getLabels } from './labels'

export function getPortTemplate(name: string, namespace: string) {

    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: name,
            namespace: namespace,
            labels: getLabels(name)
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