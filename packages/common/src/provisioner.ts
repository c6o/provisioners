import { ulid } from 'ulid'
import { mix } from 'mixwith'
import * as path from 'path'
import { promises as fs } from 'fs'

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
}