import { Namespace } from '@c6o/kubeclient-resources/core/v1'
import { ResourceHelper } from '@c6o/kubeclient-contracts'

export class NamespaceHelper<R extends Namespace = Namespace> extends ResourceHelper<R> {
    static template = (name?: string): Namespace => ({
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name
        }
    })

    static from = (name?: string) =>
        new NamespaceHelper(NamespaceHelper.template(name))
}