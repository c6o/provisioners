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

export function getPVC(name, namespace) {
    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name,
            namespace
        }
    }
}

export function getPV(name) {
    return {
        kind: 'PersistentVolume',
        apiVersion: 'v1',
        metadata:
        {
            name
        }
    }
}
