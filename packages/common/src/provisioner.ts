import { mix } from '@traxitt/common'
import * as path from 'path'
import { promises as fs } from 'fs'

import {
    namespaceMixin,
    passwordMixin
} from './mixins'
import { ProvisionerManager, optionFunctionType } from './manager'

export interface ProvisionerBase { }
export type baseProvisionerMixinType = new (...a) => ProvisionerBase

export class provisionerBasePrivate {
}

export class ProvisionerBase extends mix(provisionerBasePrivate).with(namespaceMixin, passwordMixin) {
    options: any
    manager: ProvisionerManager
    serviceName: string
    spec: any
    applicationSpec: any

    // Has other API functions
    [key: string]: any

    help (command: string, options: optionFunctionType, messages: string[]) {}

    preprovision() {}

    provision() {
        throw new Error('Function provision must be implemented')
    }

    predeprovision() {}

    deprovision() {
        throw new Error('Function deprovision must be implemented')
    }

    serve(req, res, moduleLocation, serverRoot = 'lib/ui') {
        const root = path.resolve(moduleLocation, serverRoot)
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
}