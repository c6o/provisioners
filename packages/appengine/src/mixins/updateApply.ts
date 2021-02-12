import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('c6o-system:updateApply:')

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {

    async updateDetatchVolume(appNamespace) {
        const removeVolumeClaim = this.spec['remove-volume-claim']
        if (removeVolumeClaim) {
            this.manager.status?.push('Adding Volume Claim to Application')
            await this.detatchVolume(removeVolumeClaim.volumeClaim, appNamespace, true)
            this.manager.document.spec.provisioner['remove-volume-claim'] = '$unset'
            this.manager.status?.pop()
        }
        return false
    }

    async updateAttachVolume(appNamespace) {
        const addVolumeClaim = this.spec['add-volume-claim']
        if (addVolumeClaim) {
            this.manager.status?.push('Adding Volume Claim to Application')
            await this.attachVolume(addVolumeClaim.volumeClaim, appNamespace, true)
            this.manager.document.spec.provisioner['add-volume-claim'] = '$unset'
            this.manager.status?.pop()
        }
        return false
    }

    async updateTakeSnapshot(appNamespace) {
        const takeSnapshot = this.spec['take-snapshot']
        if (removeVolumeClaim) {
            this.manager.status?.push('Snapshotting Volume for Application')
            await this.takeSnapshot(takeSnapshot.volumeClaim, appNamespace, false)
            this.manager.document.spec.provisioner['take-snapshot'] = '$unset'
            this.manager.status?.pop()
        }
        return false
    }

    async updatRestoreSnapshot(appNamespace) {
        const restoreSnapshot = this.spec['restore-snapshot']
        if (restoreSnapshot) {
            this.manager.status?.push('Restoring volume from snapshot for Application')
            await this.restoreSnapshot(restoreSnapshot.snapshot, restoreSnapshot.volumeClaim, appNamespace, true)
            this.manager.document.spec.provisioner['restore-snapshot'] = '$unset'
            this.manager.status?.pop()
        }
        return false
    }

    async updateApply() {
        const appNamespace = this.manager.document.metadata.namespace

        await this.updateDetatchVolume(appNamespace)
        await this.updateAttachVolume(appNamespace)
        await this.updateTakeSnapshot(appNamespace)
        await this.updatRestoreSnapshot(appNamespace)
    }
}