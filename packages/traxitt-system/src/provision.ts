import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(context: Context) {
    debug('provision called', context)

    await context
        .object({
            kind: 'Pod',
            labelSelector: { app: 'rabbitmq' }
        })
        .list()
        .check(
            (pods) => context.log('PODS', pods.result),
            provisionRabbitMQ
        )
        .run()
}

async function provisionRabbitMQ(pods) {
    // No rabbitmq pods were found. Provision from scratch
    const { context } = pods

    pods
        .watch()
        .when(({ obj, condition }) => obj.metadata.name == 'rabbitmq-0' && condition.Ready == 'True',
            provisionTraxittSystem
        )

    context.log('\n###=> Setting up rabbitmq\n')

    await context
        .fromFile('../k8s/rabbitmq_rbac.yaml')
        .apply()
        .fromFile('../k8s/rabbitmq.yaml')
        .apply()
        .run()

    await pods.watchCompletion()
}

async function provisionTraxittSystem(pods) {
    const { context } = pods

    context.log('\n###=> Setting up traxitt-system\n')

    await context
        .fromFile('../k8s/registry.yaml')
        .apply()
        .fromFile('../k8s/publisher.yaml')
        .apply()
        .fromFile('../k8s/subscriber.yaml')
        .apply()
        .run()

    pods.doneWatch()
        .run()
}