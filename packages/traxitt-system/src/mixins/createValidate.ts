import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    hubToClusterMap = {
        'https://staging.hub.traxitt.com': 'stg.traxitt.org',
        'https://develop.hub.traxitt.com': 'dev.traxitt.org',
        'https://staging.hub.codezero.io': 'stg.codezero.cloud',
        'https://develop.hub.codezero.io': 'dev.codezero.cloud'
    }

    async createValidate() {

        const {
            protocol,
            accountName,
            clusterId,
            clusterKey,
            clusterNamespace,
            tag,
            hubServerURL } = this.spec

        if (!accountName)
            throw new Error('Account name is required')

        if (!clusterId)
            throw new Error('Cluster Id is required')

        if (!clusterNamespace)
            throw new Error('Cluster Namespace is required')

        if (!hubServerURL)
            throw new Error('Hub Server URL is required')

        if (!clusterKey)
            throw new Error('Cluster key is required')

        if (!protocol)
            this.spec.protocol = 'https'

        if (!tag)
            this.spec.tag = 'latest'

        if (!this.spec.clusterDomain)
            this.spec.clusterDomain = this.hubToClusterMap[this.spec.hubServerURL] || 'codezero.cloud'

        // TODO: This is a hack - we actually add the CRDs here
        // because it is required before apply is called!
        // Can't move this to the provisioner because apply expects a CRD
        if ((await this.manager.cluster.version()).gte('1.16.0'))
            await this.manager.cluster
                .begin(`Provision c6o CRDs for apiextensions.k8s.io/v1`)
                    .upsertFile('../../k8s/crds/apps.v1.yaml')
                    .upsertFile('../../k8s/crds/tasks.v1.yaml')
                    .upsertFile('../../k8s/crds/users.v1.yaml')
                    .upsertFile('../../k8s/crds/oauth.v1.yaml')
                .end()
        else
            await this.manager.cluster
                .begin(`Provision c6o CRDs for apiextensions.k8s.io/v1beta1`)
                    .upsertFile('../../k8s/crds/apps.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/tasks.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/users.v1beta1.yaml')
                    .upsertFile('../../k8s/crds/oauth.v1beta1.yaml')
                .end()
    }
}