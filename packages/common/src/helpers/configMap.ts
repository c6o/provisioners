import { keyValue } from '@c6o/kubeclient-contracts'
import { ConfigMap } from '@c6o/kubeclient-resources/core/v1'
import { ConfigMapHelper as ConfigMapHelperContract } from '@provisioner/contracts'

export class ConfigMapHelper<T extends ConfigMap = ConfigMap> extends ConfigMapHelperContract<T> {

    static from = (namespace?: string, name?: string) =>
        new ConfigMapHelper(ConfigMapHelper.template(namespace, name))

    static toKeyValues(configMap: ConfigMap): keyValue {
        if (!configMap.data) return {}
        return { ...configMap.data }
    }
}