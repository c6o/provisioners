import * as yaml from 'js-yaml'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { promises as fs } from 'fs'

import { baseProvisionerType } from '../../'

export const prometheusApiMixin = (base: baseProvisionerType) => class extends base {


    async linkPrometheus(prometheusNamespace, istioNamespace) {
        const prometheusProvisioner = await this.manager.getProvisioner('prometheus')
        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')

        const jobs = await this.loadYaml(path.resolve(__dirname, '../../../prometheus/jobs.yaml'), { istioNamespace })
        await prometheusProvisioner.addJobs(jobs)

        await prometheusProvisioner.endConfig()
    }

    async unlinkPrometheus(prometheusNamespace, istioNamespace) {
        const prometheusProvisioner = await this.manager.getProvisioner('prometheus')

        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')
        await prometheusProvisioner.removeAllJobs()
        await prometheusProvisioner.endConfig()
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