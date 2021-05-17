import { mix } from 'mixwith'
import * as path from 'path'
import { promises as fs } from 'fs'
import { optionFunctionType, AppHelper, ProvisionerBase as ProvisionerBaseContract, Controller} from '@provisioner/contracts'

import {
    optionsMixin
} from './mixins'

//export interface ProvisionerBase { }
export type baseProvisionerMixinType = new (...a) => ProvisionerBaseContract

export class ProvisionerBasePrivate { }

const provisionerBaseMixin: baseProvisionerMixinType = mix(ProvisionerBasePrivate).with(optionsMixin)
export class ProvisionerBase extends provisionerBaseMixin {
    controller: Controller

    serviceName: string
    moduleLocation: string

    spec: any
    serviceNamespace: string

    // Has other API functions
    //[key: string]: any
    routes?: any
    logger?: any

    get edition(): string { return this.controller?.resource?.metadata?.labels['system.codezero.io/edition'] }

    _documentHelper
    get documentHelper(): AppHelper {
        if (this._documentHelper) return this._documentHelper
        if (!this.controller.resource) return
        return this._documentHelper = new AppHelper(this.controller.resource)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    help(command: string, options: optionFunctionType, messages: string[]) {
        // No Op
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
        const result = await this.controller.cluster.read(service)

        if (result.error) {
            this.logger?.error(result.error)
            throw result.error
        }
        return result.object?.spec?.clusterIP
    }
}