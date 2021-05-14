import { Resource, ResourceHelper, keyValue } from '@c6o/kubeclient-contracts'

export interface CodeZeroLabels extends keyValue {
    'app.kubernetes.io/managed-by': 'codezero'

    'system.codezero.io/display'?: string
    'system.codezero.io/iconUrl'?: string
}


export interface CodeZeroResource extends Resource {
    labels?: CodeZeroLabels
}

export class CodeZeroHelper<T extends CodeZeroResource> extends ResourceHelper<T> {

    get displayName() { return this.resource.metadata.annotations?.['system.codezero.io/display'] || this.name }
    get iconUrl() { return this.resource.metadata.annotations?.['system.codezero.io/iconUrl'] }

    get componentLabels(): CodeZeroLabels {
        return {
            'app.kubernetes.io/managed-by': 'codezero'
        }
    }
}
