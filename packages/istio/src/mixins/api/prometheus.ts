import * as yaml from 'js-yaml'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { promises as fs } from 'fs'
import { PrometheusProvisioner } from '@provisioner/prometheus'

import { baseProvisionerType } from '../../'

declare module '../../' {
    export interface Provisioner {
        linkPrometheus(prometheusNamespace: string, istioNamespace: string): Promise<void>
        unlinkPrometheus(istioNamespace: string, clearLinkField?: boolean): Promise<void>
    }
}

export const prometheusApiMixin = (base: baseProvisionerType) => class extends base {

    async linkPrometheus(prometheusNamespace, istioNamespace) {
        await this.unlinkPrometheus(istioNamespace, false)
        await super.cluster.begin('Adding access for Prometheus')
            .upsertFile('../../../k8s/prometheus/prometheus-rbac.yaml', { istioNamespace, prometheusNamespace })
        .end()
        const prometheusProvisioner = await super.resolver.getAppProvisioner<PrometheusProvisioner>('prometheus', prometheusNamespace)

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

        super.status?.push('Removing access for Prometheus')
        await super.cluster.delete(clusterRole)
        await super.cluster.delete(clusterRoleBinding)
        super.status?.pop()

        const prometheusApps = await super.resolver.getInstalledApps('prometheus')
        for (const prometheusApp of prometheusApps) {
            const prometheusProvisioner = await super.resolver.getProvisioner<PrometheusProvisioner>(prometheusApp)
            const prometheusNamespace = prometheusApp.metadata.namespace
            await prometheusProvisioner.clearAll(prometheusNamespace, istioNamespace, 'istio')
        }
        if (clearLinkField)
            delete super.document.spec.provisioner['prometheus-link']
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