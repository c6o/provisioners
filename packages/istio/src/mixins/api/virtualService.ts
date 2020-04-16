import { baseProvisionerType } from '../../'

export const virtualServiceApiMixin = (base: baseProvisionerType) => class extends base {

    runningDeployment

    async createVirtualService(namespace: string, svcName: string, port: number): Promise<string> {
        if (!namespace || !svcName || !port)
            return

        await this.manager.cluster
            .begin(`Installing Virtual Service for ${namespace}/${svcName}:${port}`)
                .upsertFile('../../../k8s/virtualservice-template.yaml', { namespace, svcName, port, hostname: 'demo.traxitt.org' })
            .end()

        return `http://demo.traxitt.org:${port}/${namespace}/${svcName}/` // TODO - need to return object instead of string
    }

    async removeVirtualService(namespace: string, svcName: string) {
        if (!namespace || !svcName) {
            return
        }
        await this.manager.cluster
            .begin(`Removing Virtual Service for ${namespace}/${svcName}`)
                .deleteFile('../../../k8s/virtualservice-template.yaml', { namespace, svcName, port: 0, hostname: 'demo.traxitt.org' })
            .end()
    }
}