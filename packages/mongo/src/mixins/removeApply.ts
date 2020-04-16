import { baseProvisionerType } from '../'
import { Buffer } from 'buffer'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const rootPassword = super.processPassword(this.spec.rootPassword)
        const namespace = this.manager.document.metadata.namespace

        await this.manager.cluster.begin('Removing mongodb resources')
            .deleteFile('../../k8s/pvc.yaml', { namespace })
            .deleteFile('../../k8s/statefulset.yaml', { namespace, rootPassword })
            .deleteFile('../../k8s/service.yaml', { namespace })
            .deleteFile('../../k8s/root-secret.yaml', { namespace, rootPassword: Buffer.from(rootPassword).toString('base64') })
            .end()

        if (this.hasDatabasesToConfigure && this.spec.secretKeyRef) {
            // remove secret
            const configMapSecret = {
                kind: 'Secret',
                metadata: {
                    namespace: namespace,
                    name: this.spec.secretKeyRef
                }
            }

            await this.manager.cluster.begin('Removing mongodb connection secret')
                .delete(configMapSecret)
                .end()
        }

    }
}