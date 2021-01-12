import { Volume, keyValue } from '@provisioner/appengine-contracts'

export function getPVCTemplate(volume: Volume, namespace: string, labels?: keyValue) {

    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name: volume.name.toLowerCase(),
            namespace: namespace,
            labels
        },
        spec: {
            accessModes: [
                'ReadWriteOnce'
            ],
            resources: {
                requests: {
                    storage: volume.size
                }
            }
        }
    }

}