import * as yaml from 'js-yaml'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { promises as fs } from 'fs'

import { baseProvisionerType } from '../../'

export const prometheusApiMixin = (base: baseProvisionerType) => class extends base {

    prometheusProvisioner

    async getPrometheusProvisioner() {
        if (!this.prometheusProvisioner)
            this.prometheusProvisioner = await this.manager.getProvisionerModule('prometheus')
        return this.prometheusProvisioner
    }
    
    async linkPrometheus(prometheusNamespace, istioNamespace) {
        await this.unlinkPrometheus(istioNamespace, false)
        await this.manager.cluster.begin('Adding access for Prometheus')
            .upsertFile('../../../k8s/prometheus-rbac.yaml', { istioNamespace, prometheusNamespace })
        .end()
        const prometheusProvisioner = await this.getPrometheusProvisioner()
        await prometheusProvisioner.beginConfig(prometheusNamespace, istioNamespace, 'istio')
        const jobs = await this.loadYaml(path.resolve(__dirname, '../../../prometheus/jobs.yaml'), { istioNamespace })
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

        // TODO: which provisioner module/version do we use when we want to target *all* apps in the system?
        // (same as grafana unlink)
        const prometheusProvisioner = await this.getPrometheusProvisioner()
        await prometheusProvisioner.clearAll(istioNamespace, 'istio')
        if (clearLinkField)
            delete this.manager.document.spec.provisioner['prometheus-link']
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