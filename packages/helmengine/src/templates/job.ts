
/**
 * Creates a base Job template to handle the installation.
 */
export function getJobTemplate(name: string, namespace: string, action = 'install') {
    return {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
            name: `${name}-${action}`,
            namespace: namespace
        },
        spec: {
            backoffLimit: 1, // Only try once. To allow multiple retries, must change ensureJobFinished
            template: {
                spec: {
                    restartPolicy: 'Never',
                    containers: [{
                        name: `helm-${action}`,
                        image: 'conneryn/helmengine',  // TODO: change to @c6o image
                        command: [],
                        volumeMounts: []
                    }],
                    volumes: []
                }
            }
        }
    }
}