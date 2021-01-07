import { keyValue } from "../contracts"

export function getDeploymentTemplate(
    name: string,
    namespace: string,
    image: string,
    labels: keyValue,
    tag?: string,
    imagePullPolicy?: string,
    command?: string[],
) {
    //imagePullPolicy https://kubernetes.io/docs/concepts/configuration/overview/
    //https://kubernetes.io/docs/concepts/containers/images/#updating-images

    // if not set, set it to Always, if the tag is explicitly set to latest, IfNotPresent otherwise
    imagePullPolicy = imagePullPolicy || tag === 'latest ' ? 'Always' : 'IfNotPresent'

    //support docker tags being specified in the manifest
    //used for upgrades
    image = tag && !image.includes(':') ? `${image}:${tag}` : image

    return {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            namespace: namespace,
            name: name,
            labels
        },
        spec: {
            selector: {
                matchLabels: {
                    app: name
                }
            },
            template: {
                metadata: {
                    labels
                },
                spec: {
                    containers: [{
                        name,
                        image,
                        imagePullPolicy,
                        command
                    }]
                }
            }
        }
    }
}

export const getPodTemplate = (name: string, namespace: string) => ({
    kind: 'Pod',
    metadata: {
        namespace,
        labels: {
            app: name // Has to match matchLabels above
        }
    }
})