
import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getDeploymentTemplate(name: string, namespace: string, image: string, command: string[], labels: LabelsMetadata) {

    return {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            namespace: namespace,
            name: name,
            labels: getLabels(name, labels)
        },
        spec: {
            selector: {
                matchLabels: {
                    app: name
                }
            },
            template: {
                metadata: {
                    labels: getLabels(name, labels)
                },
                spec: {
                    containers: [
                        {
                            name: name,
                            image: image,
                            imagePullPolicy: 'Always',
                            command,
                            env: []
                        }
                    ]
                }
            }
        }
    }
}