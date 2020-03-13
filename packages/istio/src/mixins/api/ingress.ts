import { baseProvisionerType } from '../../'
import { createDebug } from '@traxitt/common'

const debug = createDebug()

export const ingressApiMixin = (base: baseProvisionerType) => class extends base {

    runningDeployment

    async openIngressPort(namespace: string, svcName: string, port: number): Promise<string> {
        debug(`Installing Virtual Service for ${namespace}/${svcName}:${port}`)
        if (!namespace || !svcName || !port) {
            debug(`Missing one or more parameters to setup virtual Service for ${namespace}/${svcName}:${port}`)
            return
        }
        await this.manager.cluster
            .begin(`Installing Virtual Service for ${namespace}/${svcName}:${port}`)
                .upsertFile('../../../k8s/virtualservice-template.yaml', { namespace, svcName, port, hostname: 'demo.traxitt.org' })
            .end()

        debug(`Installed Virtual Service for ${namespace}/${svcName}:${port}`)
        return `http://demo.traxitt.org:${port}/${namespace}/${svcName}/` // TODO - need to return object instead of string
    }

    async closeIngressPort(namespace: string, svcName: string) {
        debug(`Removing Virtual Service for ${namespace}/${svcName}`)
        if (!namespace || !svcName) {
            debug(`Missing one or more parameters to teardown virtual Service for ${namespace}/${svcName}`)
            return
        }
        await this.manager.cluster
            .begin(`Removing Virtual Service for ${namespace}/${svcName}`)
                .deleteFile('../../../k8s/virtualservice-template.yaml', { namespace, svcName, port: 0, hostname: 'demo.traxitt.org' })
            .end()
    }
}