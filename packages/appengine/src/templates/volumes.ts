import { keyValue } from '@provisioner/contracts'
import { Volume } from '@provisioner/appengine-contracts'

export function getPVCTemplate(volume: Volume, namespace: string) {

    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name: volume.name.toLowerCase(),
            namespace: namespace
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