
import { getLabels } from './labels'

export function getPVCTemplate(volumeName: string, name: string, namespace: string) {

    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name: volumeName.toLowerCase(),
            namespace: namespace,
            labels: getLabels(name)
        },
        spec: {
            accessModes: [
                'ReadWriteOnce'
            ],
            resources: {
                requests: {
                    storage: volumeName
                }
            }
        }
    }

}