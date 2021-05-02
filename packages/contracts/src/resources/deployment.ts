import { CodeZeroObject } from "../codezero"
import { Deployment } from '@c6o/kubeclient-resources/apps/v1'

export class DeploymentObject<T extends Deployment = Deployment>
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