import { mix } from "mixwith"
import { ProvisionerBase } from "@provisioner/common"

import {
    userMgmtMixin,
    createApplyMixin,
    createInquireMixin,
    createValidateMixin,
    removeApplyMixin,
    removeInquireMixin,
    updateApplyMixin
} from './mixins'

export type baseProvisionerType = new (...a) => Provisioner & ProvisionerBase

export interface Provisioner extends ProvisionerBase {
}

export class Provisioner extends mix(ProvisionerBase).with(createApplyMixin, createInquireMixin, createValidateMixin, removeApplyMixin, removeInquireMixin, userMgmtMixin, updateApplyMixin) {
    get isLatest() { return this.edition === 'latest' }

    async getConfigMap(namespace: string, name: string) {

        const manifest = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: {
                name,
                namespace
            }
        }

        const result = await this.manager.cluster.read(manifest)

        if (result.error) {
            throw new Error('Failed to load Mosquitto password configMap')
        }

        return { configmap: result.object, manifest }
    }

    async restartDeployment(namespace: string, name: string) {

        const manifest = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                name,
                namespace
            }
        }
        const deploymentResult = await this.manager.cluster.read(manifest)

        if (deploymentResult.error) {
            throw new Error(`Failed to retreive deployment ${name} in ns:${namespace}`)
        }

        const deployment = deploymentResult.object

        //grab the current replica count
        const previousCount = deployment.spec?.replicas || 0
        //set replicas to 0, that will trigger a shutdown
        await this.manager.cluster.patch(deployment, { spec: { replicas: 0 } })
        //set replicas back to what it was, that will trigger a startup
        await this.manager.cluster.patch(deployment, { spec: { replicas: previousCount } })
    }
}