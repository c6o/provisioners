import { baseProvisionerType } from '../index'
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    get mosquittoPods() {
        return {
            kind: 'Pod',
            metadata: {
                namespace: this.serviceNamespace,
                labels: {
                    app: 'mosquitto'
                }
            }
        }
    }

    async createApply() {
        await this.ensureServiceNamespacesExist()
        await this.installMosquitto()
        await this.ensureMosquittoIsRunning()
    }

    async installMosquitto() {
        const namespace = this.serviceNamespace

        const {
            username,
            password,
        } = this.spec

        //we will always need to send in "users" to the configMap
        //so we set it to empty string to start with
        let users = ''
        //if we have a username && password
        if (username?.length > 0 && password?.length > 0) {
            users = await this.generateMosquittoUserPayload(username, password)
        }

        await super.cluster
            .begin('Install mosquitto deployment')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/1-deployment.yaml', { namespace, users })
            .end()


        await super.cluster
            .begin('Install NodePort')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/2-nodeport.yaml', { namespace })
            .end()

        await super.cluster
            .begin('Install Virtual Service')
            .addOwner(super.document)
            .upsertFile('../../k8s/latest/3-virtualservice.yaml', { namespace })
            .end()

    }

    async ensureMosquittoIsRunning() {
        await super.cluster.
            begin('Ensure mosquitto services are running')
            .beginWatch(this.mosquittoPods)
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}