import { CodeZeroObject } from "./codezero"
import { AppDocumentLabels } from "./app"
import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface VolumeSpec {
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
    volumeName?: string
    volumeClaimNamespace?: string
    volumeClaimName?: string
}

export type VolumeDocument = KubeDocument<AppDocumentLabels, keyValue, VolumeSpec>

export class VolumeObject<T extends VolumeDocument = VolumeDocument>
    extends CodeZeroObject<T> {

    get volumeName() {
        return this.spec.volumeName
    }

    get appName() {
        return this.owner()
    }
}