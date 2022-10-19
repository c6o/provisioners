
import { ServicePort } from '@c6o/kubeclient-resources/core/v1'

export function getServiceTemplate(name: string, namespace: string, ports: ServicePort[]) {
    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name,
            namespace: namespace
        },
        spec: {
            type: 'NodePort',
            ports,
            selector: { app: name }
        }
    }
}