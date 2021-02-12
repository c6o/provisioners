import { baseProvisionerType } from '../../'

declare module '../../' {
    export interface Provisioner {
        attachVolume(volume: string, namespace: string, restart: boolean)
        detatchVolume(namespace: string, restart: boolean)
        restoreSnapshot(snapshot: string, namespace: string)
        takeSnapshot(namespace: string)
    }
}

export const volumeMgmtMixin = (base: baseProvisionerType) => class extends base {

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async attachVolume(volume: string, namespace: string, restart: boolean) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async detatchVolume(volume: string, namespace: string, restart: boolean) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async takeSnapshot(volume: string, namespace: string, restart: boolean) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async restoreSnapshot(snapshot: string, volume: string, namespace: string, restart: boolean) {
    }
}