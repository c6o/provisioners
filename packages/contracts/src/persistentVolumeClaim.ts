import { CodeZeroObject } from "./codezero"
import { AppDocumentLabels } from "./app"
import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface PersitentVolumeClaimSpec {
    accessModes?: Array<string>
    resources?: {
        requests?: {
            storage?: string
        }
    }
    storageClassName?: string
    volumeMode?: string
    volumeName?: string
}

export type PersitentVolumeClaimDocument = KubeDocument<AppDocumentLabels, keyValue, PersitentVolumeClaimSpec>

export class PersistentVolumeClaimObject<T extends PersitentVolumeClaimDocument = PersitentVolumeClaimDocument>
    extends CodeZeroObject<T> {

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

    get volumeName() {
        return this.spec.volumeName
    }

    get appName() {
        return this.metadata.ownerReferences[0].name
    }

}