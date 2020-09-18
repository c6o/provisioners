import { baseProvisionerType } from "../index"

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.ensureApplicationIsInstalled()
        await this.ensureApplicationIsRunning()
    }

    get pods() {
        return {
            kind: "Pod",
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    name: "<%= applicationId %>"
                }
            }
        }
    }

    async ensureApplicationIsInstalled() {

        const namespace = this.serviceNamespace
        const {
            tag,
<% if (persistentVolumeEnabled) { -%>
            storageClass,
            storage,
<% } -%> 
        } = this.spec

        await this.manager.cluster
            .begin("Install <%= applicationName %> services")
                .list(this.pods)
                .do((result, processor) => {
                    if (processor && result?.object?.items?.length == 0) {
                        // There are no pods running
                        // So let's install the application
                        processor
<% if (persistentVolumeEnabled) { -%>
                            .upsertFile("../../k8s/pvc.yaml", { namespace, storage, storageClass })
<% } -%>
                            .upsertFile("../../k8s/deployment.yaml", { namespace, tag })
<% if (serviceType !== 'none') { -%>
                            .upsertFile("../../k8s/service.yaml", { namespace })
<% } -%>
                    } else {
                        throw Error("The application is already running in this namespace.")
                    }
                })
            .end()
    }

    async ensureApplicationIsRunning() {
        await this.manager.cluster.
            begin("Ensure a <%= applicationName %> replica is running")
                .beginWatch(this.pods)
                .whenWatch(({ condition }) => condition.Ready == "True", (processor) => {
                    processor.endWatch()
                })
            .end()
    }
}