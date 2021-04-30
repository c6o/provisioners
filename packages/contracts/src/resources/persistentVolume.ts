import { CodeZeroObject } from "../codezero"
import { AppDocumentLabels } from "../app"
import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface PersistentVolumeSpec {
    accessModes?: Array<string>
    capacity?: {
        storage?: string
    }
    csi?: {
        driver?: string
        fsType?: string
        volumeAttributes?: keyValue
        volumeHandle?: string
    }
    persistentVolumeReclaimPolicy?: string
    storageClassName?: string
    volumeMode?: string
}

export type PersistentVolumeDocument = KubeDocument<AppDocumentLabels, keyValue, PersistentVolumeSpec>

export class PersistentVolumeObject<T extends PersistentVolumeDocument = PersistentVolumeDocument>
    extends CodeZeroObject<T> {
}