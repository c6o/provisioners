import * as yaml from 'js-yaml'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { promises as fs } from 'fs'

import { baseProvisionerType } from '../../'

export const prometheusApiMixin = (base: baseProvisionerType) => class extends base {

    async linkPrometheus(prometheusNamespace, istioNamespace) {
        await this.unlinkPrometheus(istioNamespace, false)
        await this.manager.cluster.begin('Adding access for Prometheus')
            .upsertFile('../../../k8s/prometheus/prometheus-rbac.yaml', { istioNamespace, prometheusNamespace })
        .end()
        const prometheusProvisioner = await this.manager.getAppProvisioner('prometheus', prometheusNamespace)

        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')
        const jobs = await this.loadYaml(path.resolve(__dirname, '../../../k8s/prometheus/jobs.yaml'), { istioNamespace })
        await prometheusProvisioner.addJobs(jobs)
        await prometheusProvisioner.endConfig()
    }

    async unlinkPrometheus(istioNamespace, clearLinkField = true) {

        const clusterRole = {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRole',
            metadata: {
                name: `prometheus-${istioNamespace}`
            }
        }

        const clusterRoleBinding = {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'ClusterRoleBinding',
            metadata: {
                name: `prometheus-${istioNamespace}`
            }
        }

        this.manager.status?.push('Removing access for Prometheus')
        await this.manager.cluster.delete(clusterRole)
        await this.manager.cluster.delete(clusterRoleBinding)
        this.manager.status?.pop()

        const prometheusApps = await this.manager.getInstalledApps('prometheus')
        for (const prometheusApp of prometheusApps) {
            const prometheusProvisioner = await this.manager.getProvisioner(prometheusApp)
            const prometheusNamespace = prometheusApp.metadata.namespace
            await prometheusProvisioner.clearAll(prometheusNamespace, istioNamespace, 'istio')
        }
        if (clearLinkField)
            delete this.manager.document.spec.provisioner['prometheus-link']
    }

    // TODO: move to base?
    async loadYaml(file, params?: any) {
        const source = await fs.readFile(file, 'utf8')
        if (!params)
            return yaml.load(source)

        const template = Handlebars.compile(source, { noEscape: true })
        const content = template(params)
        return yaml.load(content)
    }
}