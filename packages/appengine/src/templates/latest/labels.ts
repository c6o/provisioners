import { LabelsMetadata } from '../../parsing'

//https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
export function getLabels(name: string, metaData: LabelsMetadata) {
    if(!metaData.editionId || metaData.editionId === '') metaData.editionId = 'preview'
    const fullAppName = `${name}-${metaData.editionId}-${metaData.id}`
    const labels = {
        app: name,
        name: name,
        'system.codezero.io/instance': fullAppName,
        'system.codezero.io/appengine': 'v1',
        'system.codezero.io/app': fullAppName,
        'system.codezero.io/id': metaData.id,
        'app.kubernetes.io/name': name,
        'app.kubernetes.io/managed-by': 'codezero',
    }
    if(metaData.version) labels['app.kubernetes.io/version'] = metaData.version
    if(metaData.component) labels['app.kubernetes.io/component'] = metaData.component
    if(metaData.partOf) labels['app.kubernetes.io/part-of'] = metaData.partOf
    if(metaData.editionId) labels['system.codezero.io/editionId'] = metaData.editionId

    return labels
}