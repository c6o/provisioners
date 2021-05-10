import { baseProvisionerType } from '../index'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pod() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: 'folding',
                    app: 'folding',
                    role: 'server'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installFolding()
        await this.ensureFoldingIsRunning()
    }

    async installFolding() {
        const namespace = this.serviceNamespace

        const {
            username,
            passkey,
            teamNumber,
        } = this.spec


        if(this.edition === 'cpu') {
            await super.cluster
            .begin('Install Folding@Home CPU deployment')
            .addOwner(super.document)
            .upsertFile('../../k8s/cpu/folding-cpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        } else if(this.edition === 'gpu') {
            await super.cluster
            .begin('Install Folding@Home GPU/CPU deployment')
            .addOwner(super.document)
            .upsertFile('../../k8s/cpu-gpu/folding-gpu-cpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        } else {
            await super.cluster
            .begin('Install Folding@Home GPU deployment')
            .addOwner(super.document)
            .upsertFile('../../k8s/gpu/folding-gpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        }

    }

    async ensureFoldingIsRunning() {
        await super.cluster.
            begin('Ensure the Folding@Home services are running')
            .beginWatch(this.pod)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}