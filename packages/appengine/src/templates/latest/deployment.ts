
import { getLabels } from './labels'

export function getDeploymentTemplate(name: string, namespace: string, image: string) {

    return {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            namespace: namespace,
            name: name,
            labels: getLabels(name)
        },
        spec: {
            selector: {
                matchLabels: {
                    app: name
                }
            },
            template: {
                metadata: {
                    labels: getLabels(name)
                },
                spec: {
                    containers: [
                        {
                            name: name,
                            image: image,
                            imagePullPolicy: 'IfNotPresent',
                            env: []
                        }
                    ]
                }
            }
        }
    }
}