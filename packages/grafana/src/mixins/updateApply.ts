import { baseProvisionerType } from '../index'

export const updateApplyMixin = (base: baseProvisionerType) => class extends base {
    updateApply() {
        // TODO: implement config updates

        // console.log('Grafana app update', this.manager.document)

        // const lastDoc = JSON.parse(this.manager.document.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'])
        // if (lastDoc.provisioner.storage != this.spec.storage) {
        //     console.log('configuration change')
        // }

    }
}