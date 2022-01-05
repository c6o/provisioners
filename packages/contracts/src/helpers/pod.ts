import { CodeZeroHelper } from '../codezero'
import { Pod } from '@c6o/kubeclient-resources/core/v1'

export class PodHelper<T extends Pod = Pod>
    extends CodeZeroHelper<T> {

    static template = (namespace?: string, name?: string): Pod => ({
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        }
    })

    static from = (namespace?: string, name?: string) =>
        new PodHelper(PodHelper.template(namespace, name))
}