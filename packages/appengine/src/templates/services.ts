
import { ServicePort } from '@provisioner/appengine-contracts'

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