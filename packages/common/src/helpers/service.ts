import { Cluster } from '@c6o/kubeclient-contracts'
import { Service } from '@c6o/kubeclient-resources/core/v1'
import { IngressParameters } from '@provisioner/contracts'
import { ServiceHelper as ServiceHelperContract } from '@provisioner/contracts'

export class ServiceHelper<T extends Service = Service> extends ServiceHelperContract<T> {

    static from = (namespace?: string, name?: string) =>
        new ServiceHelper(ServiceHelperContract.template(namespace, name))

    static template = (namespace?: string, name?: string): Service => ({
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            ...(namespace ? { namespace } : undefined),
            ...(name ? { name } : undefined),
        }
    })
    /**
     * Awaits until the LoadBalancer service has an ip address or hostname
     * @param cluster
     * @param waitingMessage
     * @returns the resulting ip and/or hostname
     */
    async awaitAddress(cluster: Cluster, waitingMessage?: string): Promise<IngressParameters> {
        let ip = null
        let hostname = null

        await cluster.
            begin(waitingMessage)
            .beginWatch(this.resource)
            .whenWatch(
                ({ obj }) => obj.status?.loadBalancer?.ingress?.length && (obj.status?.loadBalancer?.ingress[0].ip || obj.status?.loadBalancer?.ingress[0].hostname),
                (processor, service) => {
                    ip = service.status.loadBalancer.ingress[0].ip
                    hostname = service.status.loadBalancer.ingress[0].hostname
                    processor.endWatch()
                }
            )
            .end()

        return { ip, hostname }
    }
}
