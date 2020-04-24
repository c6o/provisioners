import { baseProvisionerType } from '../'

export const createValidateMixin = (base: baseProvisionerType) => class extends base {

    async createValidate() {
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