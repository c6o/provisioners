import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(context: Context) {
    debug('provision called', context)

    // TODO: Currently just checks to see if rabbitmq is installed
    // We need a better test to see if the system is already installed
    await context
        .object({
            kind: 'Pod'
        })
        .list({ app: 'rabbitmq' })
        .check(
            provisionTraxittSystem,
            provisionRabbitMQ
        )
        .run()
}

async function provisionIstio(context) {

    if (context.options.istio !== false) {
        context.log('\n###=> Setting up istio\n')
        await context
            .fromFile('../k8s/istio/crds/crd-10.yaml')
            .fromFile('../k8s/istio/crds/crd-11.yaml')
            .fromFile('../k8s/istio/crds/crd-12.yaml')
            .fromFile('../k8s/istio/crds/crd-certmanager-10.yaml')
            .fromFile('../k8s/istio/crds/crd-certmanager-11.yaml')
            .apply()
            .fromFile('../k8s/istio/istio-demo.yaml')
            .apply()
            .run()
    }
    else
        context.log('\n###=> Skipping istio\n')
}

async function provisionRabbitMQ(pods) {
    // No rabbitmq pods were found. Provision from scratch
    const { context } = pods

    await provisionIstio(context)

    pods
        .watch()
        .when(({ obj, condition }) => obj.metadata.name == 'rabbitmq-0' && condition.Ready == 'True',
            provisionTraxittSystem
        )

    context.log('\n###=> Setting up rabbitmq\n')

    await context
        .fromFile('../k8s/rabbitmq/rabbitmq_rbac.yaml')
        .apply()
        .fromFile('../k8s/rabbitmq/rabbitmq.yaml')
        .apply()
        .run()

    await pods.watchCompletion()
}

async function provisionTraxittSystem(pods) {
    const { context } = pods

    const tag = context.options.tag || 'canary'
    context.log(`\n###=> Setting up traxitt-system with tag ${tag}\n`)

    await context
        .fromFile('../k8s/registry.yaml', { tag })
        .apply()
        .fromFile('../k8s/publisher.yaml', { tag })
        .apply()
        .fromFile('../k8s/subscriber.yaml', { tag })
        .apply()
        .run()

    pods.doneWatch()
        .run()
}