import { createDebug } from '@traxitt/common'
import { Context } from '@traxitt/kubeclient'

const debug = createDebug()

export async function deprovision(context: Context) {
    debug('deprovision called', context)
    // Nothing really to do here
}