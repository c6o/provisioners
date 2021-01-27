import { baseProvisionerType } from '../index'
import createDebug from 'debug'

const debug = createDebug('@appengine:createValidate')

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
        if (this.documentHelper.flow && this.documentHelper.flow !== '$unset')
            throw new Error('AppEngine Flow has to be completed before App can be applied')

        if (this.documentHelper.volumes?.length)
            throw new Error('Volumes are not supported yet')
    }
}