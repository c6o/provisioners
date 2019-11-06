import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(context: Context) {
    debug('provision kafka called', context)

    context.log('provision kafka called!');

    await context
    .object({
        kind: 'Pod'
    })
    .list({ 'component':'kafka-broker'})
    .check(
        () => context.log('Nothing to do here'),
        provisionKafka
    )
    .run()

}

async function provisionKafka(pods) {
    const { context } = pods

    context.log('\n###=> Setting up kafka\n')
    pods
        .watch()
        .when(
            ({ obj, condition }) => obj.metadata.name == 'kafka-0' && condition.Ready == 'True',
            () => pods.doneWatch()
        )

    const settings = {
    }

    await context
        .fromFile('../k8s/kafka-complete.yaml', settings)
        .apply()
        .run()

    context.log('Waiting for kafka to start...')
    await pods.watchCompletion()
    context.log('Kafka started...')

}
