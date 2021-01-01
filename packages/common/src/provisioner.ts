import { ulid } from 'ulid'
import { mix } from 'mixwith'
import * as path from 'path'
import { promises as fs } from 'fs'
import { KubeDocument } from '@c6o/kubeclient-contracts'

import {
    namespaceMixin,
    storageClassMixin,
    passwordMixin,
    optionsMixin,
    updateMixin
} from './mixins'
import { ProvisionerManager, optionFunctionType } from './manager'

export interface ProvisionerBase { }
export type baseProvisionerMixinType = new (...a) => ProvisionerBase

export class provisionerBasePrivate {
}

export class ProvisionerBase extends mix(provisionerBasePrivate).with(namespaceMixin, storageClassMixin, passwordMixin, optionsMixin, updateMixin) {
    manager: ProvisionerManager
    serviceName: string
    moduleLocation: string

    taskSpec: any

    spec: any

    // Has other API functions
    [key: string]: any

    help (command: string, options: optionFunctionType, messages: string[]) {}

    get edition(): string { return this.manager?.document?.metadata?.labels['system.codezero.io/edition'] }

    serve(req, res, serverRoot = 'lib/ui') {
        const root = path.resolve(this.moduleLocation, serverRoot)
        res.sendFile(req.url, {root})
    }

    async serveApi(req, res) {
        const routes = this.routes?.()
        const resource = routes[req.url.toLowerCase()]

        let routeFunction
        switch (req.method) {
            case 'GET':
                routeFunction = resource?.get
                break
            case 'POST':
                routeFunction = resource?.post
                break
            case 'PUT':
                routeFunction = resource?.put
                break
            case 'DELETE':
                routeFunction = resource?.delete
                break
        }

        if (routeFunction) {
            const response = await routeFunction.func?.apply(this, routeFunction?.params(req.query, req.body))
            if (response)
                res.json(response)
        }

        throw Error('Function not found')
    }

    async readFile(...args: string[]): Promise<string> {
        const buffer = await fs.readFile(path.resolve(...args))
        return buffer.toString('utf-8')
    }

    toTask = (namespace, ask: string, spec: any) => ({
        apiVersion: 'system.codezero.io/v1',
        kind: 'Task',
        metadata: {
            namespace,
            name: `${this.serviceName}-${ulid().toLowerCase()}`,
            labels: {
                app: `${this.serviceName}`,
                ask
            }
        },
        spec
    })

    async createTask(namespace, ask: string, spec: any) {
        const taskDocument = this.toTask(namespace, ask, spec)
        return await this.manager.cluster.create(taskDocument)
    }

    async getIngressGatewayServiceClusterIp() {
        const service = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                namespace: 'istio-system',
                name: 'istio-ingressgateway', // constants?
                labels: {
                    app: 'istio-ingressgateway'
                }
            }
        }
        const result = await this.manager.cluster.read(service)

        if (result.error) {
            this.logger?.error(result.error)
            throw result.error
        }
        return result.object?.spec?.clusterIP
    }

    async restartDeployment(namespace: string, name: string) {

        const service = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace,
                name,
            }
        }

        const result = await this.manager.cluster.read(service)

        if (result.error) {
            this.logger?.error(result.error)
            throw result.error
        }

        const deployment = result.object

        const previousCount = deployment.spec?.replicas
        await this.manager.cluster.patch(deployment, { spec: { replicas: 0 } })
        await this.manager.cluster.patch(deployment, { spec: { replicas: previousCount } })
    }

    async getServiceAddress(service: Partial<KubeDocument>) {
        let ip = null
        let hostname = null

        await this.manager.cluster.
            begin(`Fetch external address`)
            .beginWatch(service)
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