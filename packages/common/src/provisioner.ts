import path from 'path'
import { mix } from '@traxitt/common'
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
}