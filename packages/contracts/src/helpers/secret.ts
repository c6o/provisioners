import { keyValue, ResourceHelper } from '@c6o/kubeclient-contracts'
import { Secret } from '@c6o/kubeclient-resources/core/v1'

export class SecretHelper<T extends Secret = Secret>
    extends ResourceHelper<T> {

    static from = (namespace?: string, name?: string) =>
        new SecretHelper(SecretHelper.template(namespace, name))

    static template = (namespace?: string, name?: string, data?: keyValue): Secret => ({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        },
        ...(data ? { data } : undefined),
    })
}