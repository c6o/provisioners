import { keyValue } from '@c6o/kubeclient-contracts'
import { Secret, SecretList } from '@c6o/kubeclient-resources/core/v1'
import { SecretHelper as SecretHelperContract } from '@provisioner/contracts'

export class SecretHelper<T extends Secret = Secret> extends SecretHelperContract<T> {

    resourceList: SecretList

    static from = (namespace?: string, name?: string) =>
        new SecretHelper(SecretHelper.template(namespace, name))

    static toKeyValues(secrets: Secret): keyValue {
        if (!secrets.data) return {}
        const data = {}
        Object.keys(secrets.data).forEach(key =>
            data[key] = Buffer.from(secrets.data[key], 'base64')
        )
        return data
    }
}