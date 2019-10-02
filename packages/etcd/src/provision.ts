import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(context: Context) {
    debug('provision called', context)

    // TODO: Currently just checks to see if etcd-operator is installed
    // We need a better test to see if the system is already installed
    await context
        .object({
            kind: 'Pod'
        })
        .list({ app: 'etcd' })
        .check(
            () => context.log('Nothing to do here'),
            provisionEtcd
        )
        .run()
}

async function provisionEtcd(pods) {
    const { context } = pods

    context.log(`\n###=> Setting up etcd \n`)

    pods
        .watch()
        .when(
            ({ obj, condition }) => obj.metadata.name == 'etcd-0' && condition.Ready == 'True',
            () => pods.doneWatch()
        )

    const replicas = context.params.spec.replicas || 3
    const storageClass = context.params.spec.storageClass || "do-block-storage"

    const settings = {
        replicas,
        storageClass,
        peers: "etcd-0=http://etcd-0.etcd:2380,etcd-1=http://etcd-1.etcd:2380,etcd-2=http://etcd-2.etcd:2380",
    }

    await context
        .fromFile('../k8s/etcd.yaml', settings)
        .apply()
        .run()

        context.log('Waiting for etcd to start...')
    await pods.watchCompletion()
    context.log('Done waiting for etcd to start...')

}