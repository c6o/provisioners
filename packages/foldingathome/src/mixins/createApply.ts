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
            await this.controller.cluster
            .begin('Install Folding@Home CPU deployment')
            .addOwner(this.controller.resource)
            .upsertFile('../../k8s/cpu/folding-cpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        } else if(this.edition === 'gpu') {
            await this.controller.cluster
            .begin('Install Folding@Home GPU/CPU deployment')
            .addOwner(this.controller.resource)
            .upsertFile('../../k8s/cpu-gpu/folding-gpu-cpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        } else {
            await this.controller.cluster
            .begin('Install Folding@Home GPU deployment')
            .addOwner(this.controller.resource)
            .upsertFile('../../k8s/gpu/folding-gpu.yaml', { namespace, username, passkey, teamNumber })
            .end()

        }

    }

    async ensureFoldingIsRunning() {
        await this.controller.cluster.
            begin('Ensure the Folding@Home services are running')
            .beginWatch(this.pod)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}