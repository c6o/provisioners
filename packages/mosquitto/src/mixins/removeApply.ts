import { baseProvisionerType } from '../index'
import { metadata } from 'core-js/fn/reflect'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {


    async removeApply() {
        const namespace = this.manager.document.metadata.namespace

        // It is then safe to remove the following
        // You may not have to remove the following because owners takes care of most of it
        await this.manager.cluster
            .begin('De-provisioning the app')
            .deleteFile('../../k8s/latest/3-virtualservice.yaml', { namespace })
            .deleteFile('../../k8s/latest/2-nodeport.yaml', { namespace })
            .deleteFile('../../k8s/latest/1-deployment.yaml', { namespace })
            .end()
    }
}