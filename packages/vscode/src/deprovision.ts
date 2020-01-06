import { createDebug } from '@traxitt/common'
import { Cluster } from '@traxitt/kubeclient'
import { ensureNamespaceObject } from '@provisioner/common'

const debug = createDebug()

export async function deprovision(cluster: Cluster, spec) {

    ensureNamespaceObject(spec)

    const namespace = spec.namespace.metadata.name

    await cluster
        .begin(`Uninstall dev services`)
            .deleteFile('../k8s/pod.yaml', { namespace, image: '' })
            .if(!spec.options['keep-ip'], (processor) => processor.deleteFile('../k8s/svc.yaml', { namespace }))
            .if(!spec.options['keep-vol'], (processor) => processor.deleteFile('../k8s/pvc.yaml', { namespace }))
        .end()
}

