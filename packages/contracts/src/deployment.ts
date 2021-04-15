import { CodeZeroObject } from "./codezero"
import { AppDocumentLabels } from "./app"
import { KubeDocument, keyValue } from '@c6o/kubeclient-contracts'

export interface DeploymentMetadata {
    annotations?: {}
    creationTimestamp?: string
    generation?: number
    labels?: AppDocumentLabels
    managedFields?: [{}]
    name?: string
    namespace?: string
    ownerReferences?: [{
        apiVersion: string
        blockOwnerDeletion: boolean
        kind: string
        name: string
        uid: string
        resourceVersion: string
    }]
    uid?: string
}

export interface DeploymentSpec {
    progressDeadlineSeconds?: number
    replicas?: number
    revisionHistoryLimit?: number
    selector?: {
        matchLabels?: {
            app?: string
        }
    }
    strategy?: {
        rollingUpdate?: {
            maxSurge?: string
            maxUnavailable?: string
        }
        type?: string
    }
    template: {
        metadata: {
            creationTimestamp: null
            labels: AppDocumentLabels
        }
        spec: {
            containers?: [
                {
                    envFrom?: [
                        {
                            configMapRef: {
                                name: string
                            }
                        }]
                    image?: string
                    imagePullPolicy?: string
                    name?: string
                    ports?: [
                        {
                            containerPort: number
                        }]
                    protocol?: string
                    resources?: {}
                    terminationMessagePath?: string
                    terminationMessagePolicy?: string
                    volumeMounts?: [
                        {
                            mountPath: string
                            name: string
                        }
                    ]
                }
            ]
            dnsPolicy?: string
            restartPolicy?: string
            schedulerName?: string
            securityContext?: {
                fsGroup?: number
            }
            terminationGracePeriodSeconds?: number
            volumes?: [
                {
                    name: string
                    persistentVolumeClaim: {
                        claimName: string
                    }
                }
            ]
        }
    }
}

export type DeploymentDocument = KubeDocument<AppDocumentLabels, keyValue, DeploymentSpec>

export class DeploymentObject<T extends DeploymentDocument = DeploymentDocument>
    extends CodeZeroObject<T> {

    get spec() {
        return this.document.spec
    }

    get templateSpec() {
        return this.spec?.template?.spec
    }

    get metadata() {
        return this.document.metadata
    }

    get isNew() {
        return !!this.metadata?.uid
    }

    get ownerReferences() {
        return this.metadata?.ownerReferences
    }

    get appName() {
        return this.metadata?.ownerReferences[0].name
    }

    get volumes() {
        return this.templateSpec?.volumes
    }

    static volumesPath() {
        return '/spec/template/spec/volumes'
    }

    get volumeMounts() {
        return this.templateSpec?.containers[0]?.volumeMounts
    }

    static volumeMountsPath() {
        return '/spec/template/spec/containers/volumeMounts'
    }

    get volumesNotMounted() {
        return this.volumes?.filter(volume =>
            !this.volumeMounts.some(volumeMount =>
                volume.name === volumeMount.name
            )
        )
    }
}