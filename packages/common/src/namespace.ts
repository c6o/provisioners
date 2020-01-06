import { Cluster, KubeObject } from '@traxitt/kubeclient'

export const ensureNamespaceObject = (spec) => {
    const namespace = spec.namespace ? (spec.namespace.spec || spec.namespace) : undefined

    if (namespace) {
        spec.namespace =
            namespace.kind ?
                KubeObject.ensureInstance(namespace) :
                new KubeObject({
                    kind: 'Namespace',
                    apiVersion: 'v1',
                    metadata: {
                        name: namespace
                    }
                })
        return
    }

    if (spec.provisionSpec) {
        // We are dealing with a service spec
        // Given that we don't have a namespace specified, we use the
        // application namespace
        ensureNamespaceObject(spec.provisionSpec)
        spec.namespace = spec.provisionSpec.namespace
        return
    } else {
        // We're dealing with an application spec
        // Check to see if the user has passed in a namespace
        if (spec.options?.namespace) {
            spec.namespace = spec.options.namespace
            ensureNamespaceObject(spec)
        }
    }

    // No namespace has been found - generate a namespace based on the name
    // Perhaps we should consider throwing an exception here
    spec.namespace = new KubeObject({
        kind: 'Namespace',
        apiVersion: 'v1',
        metadata: {
            name: spec.name + '-ns'
        }
    })
}

export async function ensureNamespaceExists(cluster: Cluster, spec) {

    if (spec.status?.namespaceCreated)
        return // We have already processed this spec

    if (spec.provisionSpec) {
        // We're dealing with a service spec because it has a provisionSpec
        // Make sure the application namespace exists first
        await ensureNamespaceExists(cluster, spec.provisionSpec)
    }

    // Let's make sure a namespace exists first
    ensureNamespaceObject(spec)

    if (spec.namespace.metadata.name == spec.provisionSpec?.namespace.metadata.name)
        return // The spec has the same namespace as the application which is already created

    // Create the namespace if it doesn't exist
    await cluster
        .begin(`Create ${spec.name} namespace ${spec.namespace.metadata.name}`)
            .upsert(spec.namespace)
        .end()

    // Flag the status as done
    spec.status = {
        ...spec.status,
        namespaceCreated: true
    }
}