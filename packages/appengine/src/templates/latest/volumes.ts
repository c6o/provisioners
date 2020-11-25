import { LabelsMetadata, Volume } from '../../parsing'
import { getLabels } from './labels'

export function getPVCTemplate(volume: Volume, namespace: string, metaData: LabelsMetadata) {

    return {
        kind: 'PersistentVolumeClaim',
        apiVersion: 'v1',
        metadata: {
            name: volume.name.toLowerCase(),
            namespace: namespace,
            labels: getLabels(volume.name, metaData)
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