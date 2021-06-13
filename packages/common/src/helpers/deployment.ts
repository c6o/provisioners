import { Cluster, keyValue } from '@c6o/kubeclient-contracts'
import { Deployment, DeploymentList } from '@c6o/kubeclient-resources/apps/v1'
import { DeploymentHelper as DeploymentHelperContract } from '@provisioner/contracts'

export class DeploymentHelper<T extends Deployment = Deployment> extends DeploymentHelperContract<T> {

    resourceList: DeploymentList

    static from = (namespace?: string, name?: string) =>
        new DeploymentHelper(DeploymentHelperContract.template(namespace, name))

    /** Restarts the deployment - does not wait until it's restarted */
    async restart(cluster: Cluster): Promise<Deployment> {
        const result = await cluster.read(this.resource)
        result.throwIfError(`Failed to restart deployment ${this.name} in ${this.namespace}`)

        const deployment = result.as<Deployment>()

        const previousCount = deployment.spec?.replicas

        await cluster.patch(deployment, { spec: { replicas: 0 } })
        await cluster.patch(deployment, { spec: { replicas: previousCount } })
        return deployment
    }

    /** Get the containers from the template spec for pods. */
    static containers(deployments: Deployment[], section?) {
        return deployments.reduce((acc, deployment) => {
            return [...acc, ...deployment.spec.template.spec.containers.reduce((acc2, container) => {
                if (section && container[section]) acc2.push(container[section])
                else if (!section) acc2.push(container)
                return acc2
            }, [])]
        }, [])
    }

    /** Returns container references to environment variables, the envFrom list. */
    static keyMapReferences(deployments: Deployment[]) {
        const containers = DeploymentHelper.containers(deployments, 'envFrom')
        return containers ? containers.reduce((acc1, container) => {
            return container ? container.reduce((acc2, env) => {
                acc2.push(env)
                return acc2
            }, acc1) : []
        }, []) : []
    }

    /** Get environment variables that are written directly into the deployment's templates for pods. */
    static toKeyValues(deployments: Deployment[], merge: keyValue = {}): keyValue {
        // TODO: do this with json path.
        // only env sections, not envFile.
        const containers = DeploymentHelper.containers(deployments, 'env')
        const envs = containers.reduce((acc1, container) => {
            return container.reduce((acc2, env) => {
                if (env.value) acc2[env.name] = env.value
                return acc2
            }, acc1)
        }, merge)
        return envs
    }

    /** Get the resource and convert the environment variables to a key map and return it */
    async toKeyValues(cluster: Cluster, merge: keyValue | Promise<keyValue> = {}) {
        const result = await cluster.read(this.resource)
        result.throwIfError()
        this.resourceList = result.as<DeploymentList>()
        return DeploymentHelper.toKeyValues(result.object.items as T[], await merge)
    }
}