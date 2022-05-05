import { ResourceHelper, ResourceId } from '@c6o/kubeclient-contracts'
import { Service } from '@c6o/kubeclient-resources/core/v1'

export class ServiceHelper<T extends Service = Service> extends ResourceHelper<T> { //extends ServiceHelperContract<T> {

    static template = (namespace?: string, name?: string, labels?: {[name: string]: string}): Service | ResourceId<Service> => ({
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                ...(name ? { name } : undefined),
                ...(namespace ? { namespace } : undefined),
                ...(labels ? { labels } : undefined)
            }
        })

    static from = (namespace?: string, name?: string) =>
        new ServiceHelper(ServiceHelper.template(namespace, name))
}