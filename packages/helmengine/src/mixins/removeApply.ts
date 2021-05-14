import { baseProvisionerType } from '../'
import * as templates from '../templates/'

/**
 * Perform Helm uninstall command.
 * 
 * @param base
 * @returns 
 */
export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {
        this.job = templates.getJobTemplate(this.documentHelper.name, this.documentHelper.namespace, "uninstall")
        await this.setupUninstallJobCommand()

        await this.applyUninstallJob()

        // TODO: ensureUninstall has not been verified to work yet.
        //await this.ensureUninstallJobFinished()
    }

    async setupUninstallJobCommand() {
        const { name, namespace } = this.documentHelper

        this.job.spec.template.spec.containers[0].command = [
            "helm", "uninstall", name,
            "--namespace", namespace,
        ]
    }

    async applyUninstallJob() {
        try {
            this.controller.status?.push('Creating Helm Installation Job')

            await this.controller.cluster
                .begin()
                .addOwner(this.controller.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(this.job)
                .end()
        }
        finally {
            this.controller.status?.pop()
        }
    }

    async ensureUninstallJobFinished() {
        await this.controller.cluster.
            begin(`Ensure ${this.documentHelper.name} uninstall finishes`)
            .beginWatch({
                apiVersion: this.job.apiVersion,
                kind: this.job.kind,
                metadata: {
                    name: this.job.metadata.name,
                    namespace: this.job.metadata.namespace,
                },
            })
            .whenWatch(({condition}) => condition.Complete === 'True', processor => processor.endWatch())
            .end()
    }
}