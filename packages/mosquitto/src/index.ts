import { mix } from 'mixwith'
import { ProvisionerBase } from '@provisioner/common'

import {
    userMgmtMixin,
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, createValidateMixin, userMgmtMixin, updateApplyMixin) {

    get isLatest() { return this.edition === 'latest' }


    async getSettingsConfigMap(namespace: string, name: string) {

        const manifest = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: {
                name,
                namespace
            }
        }

        const result = await this.manager.cluster.read(manifest)
        result.throwIfError(`Failed to load the ConfigMap '${name}' from '${namespace}'`)

        return { configmap: result.object, manifest }
    }



}