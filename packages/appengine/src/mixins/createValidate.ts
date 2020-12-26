import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('@appengine:createValidate')

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {

    }
}