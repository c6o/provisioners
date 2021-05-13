import { Cluster } from '@c6o/kubeclient-contracts'
import { Deployment } from '@c6o/kubeclient-resources/apps/v1'
import { DeploymentHelper as DeploymentHelperContract } from '@provisioner/contracts'

export class DeploymentHelper<T extends Deployment = Deployment> extends DeploymentHelperContract<T> {

    static from = (namespace?: string, name?: string) =>
        new DeploymentHelper(DeploymentHelperContract.template(namespace, name))

    /** Restarts the deployment - does not wait until it's restarted */
    async restart(cluster: Cluster): Promise<Deployment> {
        const result = await cluster.read(this.document)
        result.throwIfError(`Failed to restart deployment ${this.name} in ${this.namespace}`)

        const deployment = result.as<Deployment>()

        const previousCount = deployment.spec?.replicas

        await cluster.patch(deployment, { spec: { replicas: 0 } })
        await cluster.patch(deployment, { spec: { replicas: previousCount } })
        return deployment
    }
}