import { CodeZeroHelper } from "../codezero"
import { PersistentVolumeClaim } from '@c6o/kubeclient-resources/core/v1'
export class PersistentVolumeClaimObject<T extends PersistentVolumeClaim = PersistentVolumeClaim>
    extends CodeZeroHelper<T> {

    get volumeName() {
        return this.spec.volumeName
    }

    get appName() {
        return this.metadata.ownerReferences[0]?.name
    }
}