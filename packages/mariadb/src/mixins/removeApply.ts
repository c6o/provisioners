import { Buffer } from 'buffer'
import { processPassword } from '@provisioner/common'
import { baseProvisionerType } from '../'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {

    async removeApply() {

        const rootPassword = processPassword(this.spec.rootPassword)
        const namespace = this.controller.resource.metadata.namespace

        await this.controller.cluster.begin('Removing mariadb resources')
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

            await this.controller.cluster.begin('Removing mariadb connection secret')
                .delete(configMapSecret)
                .end()
        }

    }
}