import { Cluster, keyValue } from '@c6o/kubeclient-contracts'
import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { ConfigMapHelper as ConfigMapHelperContract } from '@provisioner/contracts'

export class ConfigMapHelper<T extends ConfigMap = ConfigMap> extends ConfigMapHelperContract<T> {

    static from = (namespace?: string, name?: string) =>
        new ConfigMapHelper(ConfigMapHelper.template(namespace, name))

    async toKeyValues(cluster: Cluster, merge: keyValue | Promise<keyValue> = {}) {
        const result = await cluster.read(this.resource)
        result.throwIfError()
        return result.object.items.reduce((acc, config:ConfigMap) => {
            if (!config.data) return acc
            return { ...acc, ...config.data }
        }, await merge)
    }
}