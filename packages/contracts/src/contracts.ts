import { Result, KubeDocument } from '@c6o/kubeclient-contracts'

export interface PersistenceKit {
    attach(request: AttachRequest): Promise<Result>
    copy(persisentvolumeClaimName: string, namespace: string, appId: string, targetVolumeName: string): Promise<Result> // TODO: refactor
    delete(obj: DetachRequest): Promise<Result>
    detach(obj: DetachRequest): Promise<Result>
    expand(obj: ExpandRequest): Promise<Result>
    expansionAllowed(obj: ExpansionAllowedRequest): Promise<boolean>
    list(request: ListRequest): Promise<Result>
    restore(volumeSnapshotName: string, namespace: string, appId: string, persisentvolumeClaimName: string): Promise<Result> // TODO: refactor
    snapshot(obj: SnapshotRequest): Promise<Result>
    snapshotAllowed(): Promise<boolean>
}

export interface PersistenceRequest {
    targetDoc?: KubeDocument
}

export interface AttachRequest extends PersistenceRequest {
    volumeType?: string
    volumeName?: string
    volumeClaimName?: string
    volumeSnapshotName?: string
    volumeSize?: string
    namespace: string
    appName: string
    mountPoint?: string
}

export interface DeleteRequest extends PersistenceRequest {
    persistentVolumeName?: string
}

export interface DetachRequest extends PersistenceRequest {
    persistentVolumeClaimName?: string
    mountPath?: string
    namespace: string
    appName: string
}

export interface ExpansionAllowedRequest extends PersistenceRequest {
    storageClassName: string
}

export interface ExpandRequest extends PersistenceRequest {
    persistentVolumeClaimName: string
    namespace: string
    newSize: number
    capacityUnit?: 'Gi',
    targetDoc?: object
}

export interface ListRequest extends PersistenceRequest {
    namespace: string
    appName: string
}

export interface PatchRequest extends PersistenceRequest {
    apiVersion: string
    kind: string
    name: string
    namespace?: string
    op: string
    path: string
    value: string
}

export interface SnapshotRequest extends PersistenceRequest {
    persistentVolumeClaimName: string
    namespace: string
    volumeSnapshotClassName: string
    volumeSnapshotName: string
}