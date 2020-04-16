import * as yaml from 'js-yaml'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { promises as fs } from 'fs'

import { baseProvisionerType } from '../../'

export const prometheusApiMixin = (base: baseProvisionerType) => class extends base {

    'prometheus-link' = {
        find: async () => {
            const namespace = await this.getAppLink('prometheus')
            if (!namespace) {
                // We aren't linked, find namespaces
                const apps = await this.manager.getInstalledApps('prometheus')
                const choices = apps.map(app => app.metadata.namespace) || []
                return { choices }
            }

            return { namespace }
        },

        create: async (data) => {
            const istioNamespace = data.istioNamespace
            const prometheusNamespace = data.namespace
            const namespace = await this.getAppLink('prometheus')
            if (namespace)
                return

            if (prometheusNamespace) {
                const result = await this.linkPrometheus(prometheusNamespace, istioNamespace)
                return result.object || result.error
            }
            return new Error('Namespace is required')
        },

        remove: async (istioNamespace) => {
            const prometheusNamespace = await this.getAppLink('prometheus')
            if (!prometheusNamespace)
                throw Error('Grafana is not linked. Please link it first.')

            return this.unlinkPrometheus(prometheusNamespace, istioNamespace)
        }
    }

    async linkPrometheus(prometheusNamespace, istioNamespace) {
        const prometheusProvisioner = await this.manager.getProvisioner('prometheus')
        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')

        const jobs = await this.loadYaml(path.resolve(__dirname, '../../../prometheus/jobs.yaml'), { istioNamespace })
        await prometheusProvisioner.addJobs(jobs)

        await prometheusProvisioner.endConfig()
        return await this.setAppLink('prometheus', prometheusNamespace)
    }

    async unlinkPrometheus(prometheusNamespace, istioNamespace) {
        const prometheusProvisioner = await this.manager.getProvisioner('prometheus')

        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')
        await prometheusProvisioner.removeAllJobs()
        await prometheusProvisioner.endConfig()

        return await this.setAppLink('prometheus', '')
    }

    // TODO: move to base?
    async loadYaml(file, params?: any) {
        const source = await fs.readFile(file, 'utf8')
        if (!params)
            return yaml.safeLoad(source)

        const template = Handlebars.compile(source, { noEscape: true })
        const content = template(params)
        return yaml.safeLoad(content)
    }
}