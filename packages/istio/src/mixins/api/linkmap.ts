import { baseProvisionerType } from '../../'
import { AppDocument } from '@provisioner/common'

export const linkMapMixin = (base: baseProvisionerType) => class extends base {


    // TODO: we assume istio is always in the istio-system namespace
    linkConfigMap = {
        kind: 'ConfigMap',
        metadata: {
            name: 'istio-links',
            namespace: 'istio-system'
        },
        data: {
            ['grafana-link']: '',
            ['prometheus-link']: ''
        }
    }

    istioApp :AppDocument  = {
        apiVersion: 'system.traxitt.com/v1',
        kind: 'App',
        metadata: {
            name: 'istio',
            namespace: 'istio-system'
        }
    }

    /**
     * Get namespace of app we're linked to if any.  Creates a config map
     * to store links if needed.
     *
     * @param {*} app App we're linking to (grafana or prometheus)
     * @returns
     */
    async getAppLink(app) {
        let result = await this.manager.cluster.read(this.linkConfigMap)
        let configMap
        if (!result.error)
            configMap = result.object
        else {
            result = await this.manager.cluster.upsert(this.linkConfigMap)
            if (result.error)
                throw result.error

            configMap = this.linkConfigMap
        }

        return configMap.data?.[`${app}-link`]
    }

    /**
     * Set namespace of app we're linked to
     *
     * @param {*} app App we're linking to
     * @param {*} namespace namespace of the application.
     *  Set to empty string to unlink
     * @returns
     */
    async setAppLink(app, namespace) {
        // TODO: Move out of configmap
        // await this.manager.cluster.patch(this.istioApp, {provisioner: {'link-grafana-active': namespace}})
        return await this.manager.cluster.upsert({
            ...this.linkConfigMap,
            data: {
                [`${app}-link`]: namespace
            }
        })
    }
}