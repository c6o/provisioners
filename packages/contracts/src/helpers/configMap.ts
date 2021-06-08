import { keyValue, ResourceHelper } from '@c6o/kubeclient-contracts'
import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'

export class ConfigMapHelper<T extends ConfigMap = ConfigMap>
    extends ResourceHelper<T> {

    static from = (namespace?: string, name?: string) =>
        new ConfigMapHelper(ConfigMapHelper.template(namespace, name))


    static template = (namespace?: string, name?: string, data?: keyValue): ConfigMap => ({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            ...(name ? { name } : undefined),
            ...(namespace ? { namespace } : undefined)
        },
        ...(data ? { data } : undefined),
    })
}