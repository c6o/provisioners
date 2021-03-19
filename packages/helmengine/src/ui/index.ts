import { AppEngineSettings } from '@provisioner/appengine/lib/ui'

export class HelmInstall extends AppEngineSettings {

    // TODO: I don't know how to make this work....?
    async test() {
        await this.manager.cluster
            .begin('Install Grafana services')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/pvc.yaml', { namespace, storage, storageClass })
                .upsertFile('../../k8s/deployment.yaml', { namespace, adminUsername, adminPassword })
                .upsertFile('../../k8s/service.yaml', { namespace })
            .end()
    }

}