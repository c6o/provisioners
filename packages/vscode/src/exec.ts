import { baseProvisionerType } from './index'

export const execMixin = (base: baseProvisionerType) => class extends base {

    async exec() {
        const command = this.execArgs.shift()
        switch(command) {
            case 'snapshot':
                await this.snapshot()
                // TODO: Ensure the snapshot is created
                break
            case 'copy':
                await this.copy()
                // TODO: Ensure the ports are opened
                break
            case 'open':
                await this.ports()
                // TODO: Ensure the ports are opened
                break
            case 'close':
                await this.ports(false)
                // TODO: Ensure the ports are closed
                break
            default:
                throw new Error(`Unknown command ${command}`)
        }
    }

    // From: https://www.digitalocean.com/docs/kubernetes/how-to/snapshot-volumes/
    async snapshot() {

        await this.manager.cluster
            .begin('Requesting volume snapshot')
                .create({
                    apiVersion: 'snapshot.storage.k8s.io/v1alpha1',
                    kind: 'VolumeSnapshot',
                    metadata: {
                        name: 'dev-snapshot',
                        namespace: 'c6o-system'
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

    async copy() {
        const cluster = this.manager.cluster

        // TODO: can we get CLI namespace setting this way
        // need a pre-exec function where you can ask questions for exec functions
        // by the time we get here, everything is good as in provision
        const namespace = this.options.n || this.options.namespace
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
            begin('Copy files')
                .list(devPods)
                .do((result, processor) => {
                    processor.copy(result.object.items[0], this.execArgs[0], this.execArgs[1])
                })
            .end()
    }

    // TODO works?
    async ports(open = true) {
        const cluster = this.manager.cluster

        // TODO: get options from args?
        // @ts-ignore TODO: Update kubeclient-contracts to have options
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

                const patchOps = this.execArgs.reduce((ops, port) => {
                    const index = currentPorts.findIndex(item => item.containerPort == port)
                    if (index < 0 && open)
                        ops.push({'op':'add','path':'/spec/template/spec/containers/0/ports/-','value':{'containerPort': port, protocol: 'TCP'}})
                    if (index > 0 && !open)
                        ops.push({'op':'remove','path':`/spec/template/spec/containers/0/ports/${index}`})
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
                const patchOps = this.execArgs.reduce((ops, port) => {
                    const index = currentPorts.findIndex(item => item.port == port)
                    if (index < 0 && open)
                        ops.push({'op':'add','path':'/spec/ports/-','value':{'name':`dev-${port}`,'port':port, 'targetPort':port}})
                    if (index > 0 && !open)
                        ops.push({'op':'remove','path':`/spec/ports/${index}`})
                    return ops
                }, [])


                if (patchOps.length)
                    processor.patch(result.object, patchOps)
            })
            .end()
    }

}



