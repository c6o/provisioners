import { baseProvisionerType } from '..'

export const deprovisionMixin = (base: baseProvisionerType) => class extends base {
    async deprovision() {
        const namespace = this.deprovisionNamespace

        if (this.spec.simpleService) {
            await this.manager.cluster
                .begin('Remove simple prometheus services')
                    .deleteFile('../../k8s/prometheus-simple-cm.yaml', { namespace })
                    .deleteFile('../../k8s/prometheus-simple.yaml', { namespace })
                .end()
            return
        }

        await this.manager.cluster
            .begin('Remove prometheus server')
                .deleteFile('../../k8s/prometheus-server.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-alertmanager.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-kubemetrics.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-nodeexporter.yaml', { namespace })
                .deleteFile('../../k8s/prometheus-pushgateway.yaml', { namespace })
            .end()

    }

}