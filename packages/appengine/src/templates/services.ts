
import { keyValue, ServicePort } from '@provisioner/appengine-contracts'

export function getServiceTemplate(name: string, namespace: string, ports: ServicePort[], labels?: keyValue) {
    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name,
            namespace: namespace,
            labels
        },
        spec: {
            type: 'NodePort',
            ports,
            selector: { app: name }
        }
    }
}