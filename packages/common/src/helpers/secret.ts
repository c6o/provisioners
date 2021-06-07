import { Cluster, keyValue } from '@c6o/kubeclient-contracts'
import { Secret, SecretList } from '@c6o/kubeclient-resources/core/v1'
import { SecretHelper as SecretHelperContract } from '@provisioner/contracts'

export class SecretHelper<T extends Secret = Secret> extends SecretHelperContract<T> {

    resourceList: SecretList

    static from = (namespace?: string, name?: string) =>
        new SecretHelper(SecretHelper.template(namespace, name))

    static toKeyValues(secrets: Secret[], merge: keyValue = {}): keyValue {
        return secrets.reduce((acc, secret:Secret) => {
            if (!secret.data) return acc
            const data = {}
            Object.keys(secret.data).forEach(key =>
                data[key] = Buffer.from(secret.data[key], 'base64')
            )
            return { ...acc, ...data }
        }, merge)
    }

    async toKeyValues(cluster: Cluster, merge: keyValue | Promise<keyValue> = {}) {
        const result = await cluster.read(this.resource)
        result.throwIfError()
        this.resourceList = result.as<SecretList>()
        return result.object.items.reduce((acc, secret: Secret) => {
            if (!secret.data) return acc
            const data = {}
            Object.keys(secret.data).forEach(key =>
                data[key] = Buffer.from(secret.data[key], 'base64')
            )
            return { ...acc, ...data }
        }, await merge)
    }
}