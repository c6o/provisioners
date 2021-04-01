import { KubeDocument, KubeObject, keyValue } from '@c6o/kubeclient-contracts'

export interface CodeZeroLabels extends keyValue {
    'app.kubernetes.io/managed-by': 'codezero'

    'system.codezero.io/display'?: string
    'system.codezero.io/iconUrl'?: string
}


export type CodeZeroResource = KubeDocument<CodeZeroLabels>

export class CodeZeroObject<T extends CodeZeroResource> extends KubeObject<T> {
    get name() { return this.document.metadata.name }
    get namespace() { return this.document.metadata.namespace }

    get displayName() { return this.document.metadata.annotations?.['system.codezero.io/display'] || this.name }
    get iconUrl() { return this.document.metadata.annotations?.['system.codezero.io/iconUrl'] }

    get componentLabels(): CodeZeroLabels {
        return {
            'app.kubernetes.io/managed-by': 'codezero'
        }
    }

    get spec() {
        return this.document.spec
    }

    get metadata() {
        return this.document.metadata
    }

    get isNew() {
        return !!this.metadata.uid
    }

    get ownerReferences() {
        return this.metadata.ownerReferences
    }

    get owner() {
        return this.metadata.ownerReferences[0].name
    }
}