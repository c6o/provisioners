import { LabelsMetadata } from '../../parsing'

export function getLabels(name: string, metaData: LabelsMetadata) {
    const labels = {
        app: name,
        name: name,
        'system.codezero.io/instance': `${name}-${metaData.id}`,
        'system.codezero.io/appengine': 'v1',
        'system.codezero.io/app': name,
        'app.kubernetes.io/name': name,
        'app.kubernetes.io/managed-by': 'codezero',
    }
    if(metaData.version) labels['app.kubernetes.io/version'] = metaData.version
    if(metaData.component) labels['app.kubernetes.io/component'] = metaData.component
    if(metaData.partOf) labels['app.kubernetes.io/part-of'] = metaData.partOf
    if(metaData.edition) labels['system.codezero.io/edition'] = metaData.edition

    return labels
}