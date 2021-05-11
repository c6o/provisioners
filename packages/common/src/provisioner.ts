import { mix } from 'mixwith'
import * as path from 'path'
import { promises as fs } from 'fs'
import { Cluster, Status } from '@c6o/kubeclient-contracts'
import { optionFunctionType, AppObject, ProvisionerBase as ProvisionerBaseContract, Resolver, AppDocument } from '@provisioner/contracts'

import {
    optionsMixin
} from './mixins'

//export interface ProvisionerBase { }
export type baseProvisionerMixinType = new (...a) => ProvisionerBaseContract

export class ProvisionerBasePrivate { }

const provisionerBaseMixin: baseProvisionerMixinType = mix(ProvisionerBasePrivate).with(optionsMixin)
export class ProvisionerBase extends provisionerBaseMixin {
    cluster: Cluster
    status: Status
    resolver: Resolver

    serviceName: string
    moduleLocation: string

    document: AppDocument
    spec: any
    serviceNamespace: string

    // Has other API functions
    //[key: string]: any
    routes?: any
    logger?: any

    help(command: string, options: optionFunctionType, messages: string[]) { }

    get edition(): string { return this.document?.metadata?.labels['system.codezero.io/edition'] }

    _documentHelper
    get documentHelper(): AppObject {
        if (this._documentHelper || !this.document)
            return this._documentHelper
        return this._documentHelper = new AppObject(this.document)
    }

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

    /** @deprecated */
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
        const result = await this.cluster.read(service)

        if (result.error) {
            this.logger?.error(result.error)
            throw result.error
        }
        return result.object?.spec?.clusterIP
    }
}