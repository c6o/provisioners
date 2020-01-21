import { Cluster } from '@traxitt/kubeclient'

export async function exec(cluster: Cluster, args) {
    const command = args.shift()

    switch(command) {
        case 'snapshot':
            await snapshot(cluster)
            // TODO: Ensure the snapshot is created
            break
        case 'copy':
            await copy(cluster, args)
            // TODO: Ensure the ports are opened
            break
        case 'open':
            await ports(cluster, args)
            // TODO: Ensure the ports are opened
            break
        case 'close':
            await ports(cluster, args, false)
            // TODO: Ensure the ports are closed
            break
        default:
            throw new Error(`Unknown command ${command}`)
    }
}

// From: https://www.digitalocean.com/docs/kubernetes/how-to/snapshot-volumes/
async function snapshot(cluster: Cluster) {

    await cluster
        .begin('Requesting volume snapshot')
            .create({
                apiVersion: 'snapshot.storage.k8s.io/v1alpha1',
                kind: 'VolumeSnapshot',
                metadata: {
                    name: 'dev-snapshot',
                    namespace: 'traxitt-system'
                },
                spec: {
                    source: {
                        name: 'dev-pvc',
                        kind: 'PersistentVolumeClaim'
                    }
                }
            })
        .end()
}

async function copy(cluster: Cluster, args) {
    const namespace = cluster.options.n || cluster.options.namespace
    if (!namespace)
        throw Error('Namespace is required to copy files')

    const devPods = {
        kind: 'Pod',
        metadata: {
            namespace,
            labels: {
                app: 'vscode'
            }
        }
    }

    await cluster.
        begin(`Copy files`)
            .list(devPods)
            .do((result, processor) =>
                processor.copy(result.object.items[0], args[0], args[1])
            )
        .end()
}

async function ports(cluster: Cluster, args, open = true) {
    const namespace = cluster.options.n || cluster.options.namespace
    if (!namespace)
        throw Error('Namespace is required to open ports')

    const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            namespace,
            name: 'dev-dep'
        }
    }

    const service = {
        kind: 'Service',
        metadata: {
            namespace,
            name: 'dev-pod-svc'
        }
    }

    const message = open ? 'Opening' : 'Removing'

    await cluster
        .begin(`${message} container ports`)
        .read(deployment)
        .do((result, processor) => {

            const currentPorts = result.object?.spec?.template?.spec?.containers[0]?.ports || []

            const patchOps = args.reduce((ops, port) => {
                const index = currentPorts.findIndex(item => item.containerPort == port)
                if (index < 0 && open)
                    ops.push({"op":"add","path":"/spec/template/spec/containers/0/ports/-","value":{"containerPort": port, protocol: 'TCP'}})
                if (index > 0 && !open)
                    ops.push({"op":"remove","path":`/spec/template/spec/containers/0/ports/${index}`})
                return ops
            }, [])

            if (patchOps.length)
                processor.patch(result.object, patchOps)
        })
        .end()

    await cluster
        .begin(`${message} service ports`)
        .read(service)
        .do((result, processor) => {

            const currentPorts = result.object?.spec?.ports || []
            const patchOps = args.reduce((ops, port) => {
                const index = currentPorts.findIndex(item => item.port == port)
                if (index < 0 && open)
                    ops.push({"op":"add","path":"/spec/ports/-","value":{"name":`dev-${port}`,"port":port, "targetPort":port}})
                if (index > 0 && !open)
                    ops.push({"op":"remove","path":`/spec/ports/${index}`})
                return ops
            }, [])


            if (patchOps.length)
                processor.patch(result.object, patchOps)
        })
        .end()
}