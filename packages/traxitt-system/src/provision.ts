import { createDebug, asyncForEach } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function provision(context: Context) {
    debug('provision called', context)

    const tag = context.options.tag || 'canary'
    context.log(`\n###=> Setting up traxitt-system with tag ${tag}\n`)

    await context
        .fromFile('../k8s/publisher.yaml', { tag })
        .apply()
        .fromFile('../k8s/subscriber.yaml', { tag })
        .apply()
        .run()
}