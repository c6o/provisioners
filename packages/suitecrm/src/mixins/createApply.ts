import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get pods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'suitecrm'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installSuiteCRM()
        await this.ensureSuiteCRMIsRunning()
    }

    async installSuiteCRM() {

        const namespace = this.serviceNamespace

        const {
            suitecrmusername,
            suitecrmpassword,
            databasesize,

            includeOxd,
        } = this.spec

        const username = Buffer.from(suitecrmusername).toString('base64')
        const password = Buffer.from(suitecrmpassword).toString('base64')

        const mariadbrootpassword = Buffer.from('admin').toString('base64')
        const mariadbpassword = Buffer.from('admin').toString('base64')

        await this.manager.cluster
            .begin('Install SuiteCRM Secrets')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/1-secrets.yaml', { namespace, mariadbrootpassword, mariadbpassword, suitecrmusername: username, suitecrmpassword: password  })
            .end()

        await this.manager.cluster
            .begin('Install SuiteCRM Config Maps')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/2-configmap.yaml', { namespace })
            .end()

        await this.manager.cluster
            .begin('Install SuiteCRM Persistent Volume Claims')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/3-pvc.yaml', { namespace, databasesize })
            .end()

        await this.manager.cluster
            .begin('Install SuiteCRM Networking Services')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/4-service.yaml', { namespace })
            .end()

        await this.manager.cluster
            .begin('Install SuiteCRM Stateful Sets')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/5-statefulset.yaml', { namespace, databasesize })
            .end()

        await this.manager.cluster
            .begin('Install SuiteCRM Deployment')
            .addOwner(this.manager.document)
            .upsertFile('../../k8s/latest/6-deployment.yaml', { namespace, includeOxd })
            .end()



    }

    async ensureSuiteCRMIsRunning() {
        await this.manager.cluster.
            begin('Ensure SuiteCRM services are running')
            .beginWatch(this.pods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}