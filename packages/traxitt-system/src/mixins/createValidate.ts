import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {

        const {
            accountName,
            clusterId,
            clusterNamespace,
            hubServerURL,
            hubToken } = this.spec

        if (!accountName)
            throw new Error('Account name is required')

        if (!clusterId)
            throw new Error('Cluster Id is required')

        if (!clusterNamespace)
            throw new Error('Cluster Namespace is required')

        if (!hubServerURL)
            throw new Error('Hub Server URL is required')

        if (!hubToken)
            throw new Error('Hub Token is required')

        if (!this.spec.clusterDomain)
            this.spec.clusterDomain = this.spec.hubServerURL == 'https://staging.hub.traxitt.com' ?
                'stg.traxitt.org' :
                'traxitt.org'

        // TODO: This is a hack - we actually add the CRDs here
        // because it is required before apply is called!
        // Can't move this to the provisioner because apply expects a CRD
        await this.manager.cluster
            .begin(`Provision Apps`)
                .upsertFile('../../k8s/crds/apps.yaml')
                .upsertFile('../../k8s/crds/tasks.yaml')
            .end()
    }
}