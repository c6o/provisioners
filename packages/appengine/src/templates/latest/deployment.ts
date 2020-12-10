
import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getDeploymentTemplate(
    name: string,
    namespace: string,
    image: string,
    labels: LabelsMetadata,
    tag: string = undefined,
    imagePullPolicy = undefined,
    command: string[] = undefined,
) {
    //imagePullPolicy https://kubernetes.io/docs/concepts/configuration/overview/
    //https://kubernetes.io/docs/concepts/containers/images/#updating-images

    //if there is no explicity set value
    if (imagePullPolicy === undefined) {
        //default value
        imagePullPolicy = 'IfNotPresent'
        //set it to Always, if the tag is explictly set to latest
        if (tag !== undefined && tag === 'latest') imagePullPolicy = 'Always'
    }

    //support docker tags being specified in the manifest
    //used for upgrades
    let imageWithTag = image
    if (tag !== undefined && imageWithTag.indexOf(':') <= 0) {
        imageWithTag = `${image}:${tag}`
    }

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
                            image: imageWithTag,
                            imagePullPolicy,
                            command,
                            env: []
                        }
                    ]
                }
            }
        }
    }
}