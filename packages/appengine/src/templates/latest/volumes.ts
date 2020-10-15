import { LabelsMetadata } from '../../parsing'
import { getLabels } from './labels'

export function getPVCTemplate(volumeName: string, volumeSize: string, name: string, namespace: string, metaData: LabelsMetadata) {

    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name: volumeName.toLowerCase(),
            namespace: namespace,
            labels: getLabels(name, metaData)
        },
        spec: {
            accessModes: [
                'ReadWriteOnce'
            ],
            resources: {
                requests: {
                    storage: volumeSize
                }
            }
        }
    }

}