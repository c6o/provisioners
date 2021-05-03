import { CodeZeroHelper } from "../codezero"
import { Deployment } from '@c6o/kubeclient-resources/apps/v1'

export class DeploymentObject<T extends Deployment = Deployment>
    extends CodeZeroHelper<T> {

    static volumesPath() {
        return '/spec/template/spec/volumes'
    }

    static volumeMountsPath() {
        return '/spec/template/spec/containers/volumeMounts'
    }

    get templateSpec() {
        return this.spec?.template?.spec
    }

    get appName() {
        return this.metadata?.ownerReferences[0].name
    }

    get volumes() {
        return this.templateSpec?.volumes
    }

    get volumeMounts() {
        return this.templateSpec?.containers[0]?.volumeMounts
    }

    get volumesNotMounted() {
        return this.volumes?.filter(volume =>
            !this.volumeMounts.some(volumeMount =>
                volume.name === volumeMount.name
            )
        )
    }
}