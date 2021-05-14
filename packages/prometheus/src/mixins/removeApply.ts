import { baseProvisionerType } from '..'

export const removeApplyMixin = (base: baseProvisionerType) => class extends base {
    async removeApply() {
        const namespace = this.controller.document.metadata.namespace

        if (this.spec.simpleService) {
            await this.controller.cluster
                .begin('Remove simple prometheus services')
                    .deleteFile('../../k8s/prometheus-simple-cm.yaml', { namespace })
                    .deleteFile('../../k8s/prometheus-simple.yaml', { namespace })
                .end()
            return
        }

        await this.controller.cluster
            .begin('Remove prometheus server')
                .deleteFile('../../k8s/prometheus-server.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-alertmanager.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-kubemetrics.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-nodeexporter.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-pushgateway.yaml', { namespace })
            .end()

    }

}