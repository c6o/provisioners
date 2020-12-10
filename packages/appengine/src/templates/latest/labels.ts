import { LabelsMetadata } from '../../parsing'

//https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
export function getLabels(name: string, labels: LabelsMetadata) {
    if(!labels.edition || labels.edition === '') labels.edition = 'preview'
    const fullAppName = `${name}-${labels.edition}-${labels.instanceId}`
    const finalLabels = {
        app: name,
        name: name,
        'system.codezero.io/appengine': 'v1',
        'system.codezero.io/app': name, // This is used to render GetInfo in Marina
        'system.codezero.io/id': labels.instanceId,
        'app.kubernetes.io/name': name,
        'app.kubernetes.io/managed-by': 'codezero'
    }
    if(labels.version) finalLabels['app.kubernetes.io/version'] = labels.version
    if(labels.component) finalLabels['app.kubernetes.io/component'] = labels.component
    if(labels.partOf) finalLabels['app.kubernetes.io/part-of'] = labels.partOf
    if(labels.edition) finalLabels['system.codezero.io/edition'] = labels.edition

    return finalLabels
}