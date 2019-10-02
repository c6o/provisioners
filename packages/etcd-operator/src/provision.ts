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
        .list({ name: 'etcd-operator' })
        .check(
            () => context.log('Nothing to do here'),
            provisionOperator
        )
        .run()
}

async function provisionOperator(pods) {
    const { context } = pods

    context.log(`\n###=> Setting up etcd operator\n`)

    await pods
        .watch()
        .when(
            ({ obj, condition }) => obj.metadata.labels.name == 'etcd-operator' && condition.Ready == 'True',
            async () => await provisionEtcd(context)
        )
        .when(
            ({ obj, condition }) => obj.metadata.labels.app == 'etcd' && condition.Ready == 'True',
            () => pods.doneWatch()
        )
        .run()

    const settings = {
        role_binding_name: 'etcd-cluster',
        role_name: 'etcd-cluster',
        namespace: context.namespace
    }

    await context
        .fromFile('../k8s/rbac/clusterrole.yaml', settings)
        .apply()
        .fromFile('../k8s/rbac/clusterrolebinding.yaml', settings)
        .apply()
        // .fromFile('../k8s/rbac/rolebinding.yaml', settings)
        // .apply()
        // .fromFile('../k8s/rbac/role.yaml', settings)
        // .apply()
        .fromFile('../k8s/deployment.yaml', settings)
        .apply()
        .run()

    context.log('Waiting for etcd operator to start...')
    await pods.watchCompletion()
    context.log('Done waiting for etcd to start...')

    // kubectl delete -f example/deployment.yaml
    // kubectl delete endpoints etcd-operator
    // kubectl delete crd etcdclusters.etcd.database.coreos.com
    // kubectl delete clusterrole etcd-operator
    // kubectl delete clusterrolebinding etcd-operator
}

async function provisionEtcd(context) {

    context.log('Done waiting for etcd operator to start...')

    context.log(`\n###=> Setting up etcd \n`)

    const settings = {
        role_binding_name: 'etcd-cluster',
        role_name: 'etcd-cluster',
        namespace: context.namespace
    }

    await context
        .fromFile('../k8s/etcd-cluster.yaml', settings)
        .apply()
        .run()

    context.log('Waiting for etcd to start...')
}