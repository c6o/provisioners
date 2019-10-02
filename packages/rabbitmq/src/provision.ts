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
            () => context.log('Nothing to do here'),
            provisionRabbitMQ
        )
        .run()
}

async function provisionRabbitMQ(pods) {
    // No rabbitmq pods were found. Provision from scratch
    const { context } = pods

    context.log('\n###=> Setting up rabbitmq\n')

    pods
        .watch()
        .when(
            ({ obj, condition }) => obj.metadata.name == 'rabbitmq-0' && condition.Ready == 'True',
            () => pods.doneWatch()
        )

    await context
        .fromFile('../k8s/rabbitmq_rbac.yaml')
        .apply()
        .fromFile('../k8s/rabbitmq.yaml')
        .apply()
        .run()

    context.log('Waiting for rabbitmq to start...')
    await pods.watchCompletion()
    context.log('Done waiting for rabbitmq to start...')
}
