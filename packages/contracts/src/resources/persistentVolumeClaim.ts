import { CodeZeroObject } from "../codezero"
import { AppDocumentLabels } from "../app"
import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface PersistentVolumeClaimSpec {
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

export interface PersistentVolumeClaimDocument extends KubeDocument<AppDocumentLabels, keyValue, PersistentVolumeClaimSpec> {
    // TODO: Properly define status
    status?: any
}

export class PersistentVolumeClaimObject<T extends PersistentVolumeClaimDocument = PersistentVolumeClaimDocument>
    extends CodeZeroObject<T> {

    get volumeName() {
        return this.spec.volumeName
    }

    get appName() {
        return this.owner()
    }
}