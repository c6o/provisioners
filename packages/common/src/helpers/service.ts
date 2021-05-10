import { Cluster, ResourceHelper } from '@c6o/kubeclient-contracts'
import { Service } from '@c6o/kubeclient-resources/core/v1'
import { IngressParameters } from '@provisioner/contracts'
//import { ServiceHelper as ServiceHelperContract } from '@provisioner/contracts'

export class ServiceHelper<T extends Service = Service> extends ResourceHelper<T> { //extends ServiceHelperContract<T> {

    static from(namespace?: string, name?: string) {
        return new ServiceHelper({
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name,
                namespace
            }
        })
    }

    /**
     * Awaits until the LoadBalancer service has an ip address or hostname
     * @param cluster
     * @param waitingMessage
     * @returns the resulting ip and/or hostname
     */
    async awaitServiceAddress(cluster: Cluster, waitingMessage?: string): Promise<IngressParameters> {
        let ip = null
        let hostname = null

        await cluster.
            begin(waitingMessage)
            .beginWatch(this.document)
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