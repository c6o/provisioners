
import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getDeploymentTemplate(name: string, namespace: string, image: string, metaData: LabelsMetadata) {

    return {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            namespace: namespace,
            name: name,
            labels: getLabels(name, metaData)
        },
        spec: {
            selector: {
                matchLabels: {
                    app: name
                }
            },
            template: {
                metadata: {
                    labels: getLabels(name, metaData)
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