import { keyValue, KubeDocument } from '@c6o/kubeclient-contracts'
import { baseProvisionerType } from '../index'
import createDebug from 'debug'
import * as templates from '../templates/'
import { set as setByPath } from 'lodash'

const debug = createDebug('@helmengine:createApply')

declare module '../' {
    export interface Provisioner {
        createDeploymentDocument: KubeDocument,
    }
}

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    async createApply() {
        try {
            this.manager.status?.push(`Applying Helm Engine to ${this.documentHelper.name}`)

            this.job = templates.getJobTemplate(this.documentHelper.name, this.documentHelper.namespace)
            
            // From parent AppEngine
            await this.processTemplates()

            await this.setupJobCommand()
            await this.applyServiceAccount()
            await this.applyValuesConfig()
            await this.applySecretValuesConfig()
            await this.applyPostRenderConfig()
            await this.applyJob()
            
            await this.ensureJobFinished()
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Create Job resource with base Helm install command.
     */
    async setupJobCommand() {
        const { name, namespace } = this.documentHelper
        const { chart, repo } = this.documentHelper.spec.provisioner

        this.job.spec.template.spec.containers[0].command = [
            "helm", "install", name, chart,
            "--namespace", namespace,
            "--repo", repo,
        ]
    }

    /**
     * Save provisioner configs parameters to mountable "values.yaml"
     * and apply to helm CLI.
     */
    async applyValuesConfig() {
        const { namespace, name, configs } = this.documentHelper

        if(!configs)
            return

        try {
            this.manager.status?.push('Installing configuration values')

            const createValuesConfig = await templates.getValuesTemplate(
                name,
                namespace,
                this.expandConfigs(configs)
            )

            // Create values config file
            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createValuesConfig)
                .end()


            // Add volume mount based on config values
            const volumeName = `${name}-values`
            const volumePath = "/opt/config"
            const template = this.job.spec.template.spec
            template.volumes.push({
                name: volumeName,
                configMap: {
                    name: createValuesConfig.metadata.name,
                },
            })

            // Load mounted values
            const container = template.containers[0]
            container.volumeMounts.push({
                name: volumeName,
                mountPath: volumePath,
                readOnly: true,
            })

            // Add values to command.
            container.command.push("-f")
            container.command.push(`${volumePath}/values.yaml`)
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Save provisioner secrets parameters to mountable "values.yaml"
     * and apply to helm CLI.
     */
    async applySecretValuesConfig() {
        const { namespace, name, secrets } = this.documentHelper

        if (!secrets)
            return

        try {
            this.manager.status?.push('Installing secret configuration values')

            const createSecretValues = templates.getSecretValuesTemplate(
                name,
                namespace,
                this.expandConfigs(secrets)
            )

            // Create values config file
            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createSecretValues)
                .end()

            // Add volume mount based on config values
            const volumeName = `${name}-secret-values`
            const volumePath = "/opt/configs/secrets"
            const template = this.job.spec.template.spec
            template.volumes.push({
                name: volumeName,
                secret: {
                    secretName: createSecretValues.metadata.name,
                },
            })

            // Load mounted values
            const container = template.containers[0]
            container.volumeMounts.push({
                name: volumeName,
                mountPath: volumePath,
                readOnly: true,
            })

            // Add values to command.
            container.command.push("-f")
            container.command.push(`${volumePath}/values.yaml`)
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Apply Job to the cluster.  This will schedule the helm command to execute.
     */
    async applyJob() {
        try {
            this.manager.status?.push('Creating Helm Installation Job')

            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(this.job)
                .end()
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Monitor Job progress, wait till completed.
     * 
     * NOTE: this does not mean the service is Ready.
     * TODO: we should add startupProbs to handle this properly.
     */
    async ensureJobFinished() {
        let jobStatus = null

        await this.manager.cluster.
            begin(`Ensure ${this.documentHelper.name} installation finishes`)
            .beginWatch({
                kind: 'Pod',
                metadata: {
                    namespace: this.job.metadata.namespace,
                    labels: {
                        ['job-name']: this.job.metadata.name,
                    },
                },
            })
            .whenWatch(() => true, (processor, {status: { phase }}) => {
                jobStatus = phase

                switch (phase) {
                    case 'Succeeded':
                        processor.endWatch()
                        return
                    case 'Failed':
                        this.manager.status.error(new Error("Install Job Failed"))
                        processor.endWatch()
                        return
                    default:
                        this.manager.status.info(phase)
                        return
                }
            })
            .end()

        if (jobStatus === 'Failed') {
            throw new Error("Installation Job Failed")
        }
    }

    /**
     * Helm runs a post-render script to apply commonLabels and set ownerDocument
     * This function create the kustomize script and configuration.
     */
     async applyPostRenderConfig() {
        const { namespace, name, componentLabels } = this.documentHelper

        try {
            this.manager.status?.push('Installing Post Render Processor')

            const createKustomizationConfigs = await templates.getKustomizationConfigs(
                name,
                namespace,
                componentLabels,
                this.manager.document
            )

            // Create values config file
            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createKustomizationConfigs)
                .end()


            // Add volume mount based on config values
            const volumeName = `${name}-kustomize`
            const volumePath = "/opt/kustomize"
            const template = this.job.spec.template.spec
            template.volumes.push({
                name: volumeName,
                configMap: {
                    name: createKustomizationConfigs.metadata.name,
                    items: [
                        { 
                            key: 'postrender.sh',
                            path: 'postrender.sh',
                            mode: 365, // This is chmod 555, makes file executable
                        },
                        { 
                            key: 'kustomization.yaml', 
                            path: 'kustomization.yaml',
                        },
                    ],
                },
            })

            // mount post-render configurations
            const container = template.containers[0]
            container.volumeMounts.push({
                name: volumeName,
                mountPath: volumePath,
            })

            // Add --post-renderer to helm command line args.
            container.command.push("--post-renderer")
            container.command.push(`${volumePath}/postrender.sh`)
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Helm Job must have specific access to the cluster.  This creates a service account
     * the job will run under.  By default, a cluster account with access to just the namespace
     * is created.  If the application requests 'clusterAdmin: true', a clusterServiceAccount
     * will be created instead.
     */
    async applyServiceAccount() {
        const { namespace, name } = this.documentHelper
        const serviceAccountName = `${name}-helm-installer`

        try {
            this.manager.status?.push('Setting up installer service account')

            const clusterAdmin = this.documentHelper.spec.provisioner.clusterAdmin
            const accountFile = clusterAdmin ? 'clusterServiceAccount.yaml' : 'serviceAccount.yaml'
            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsertFile(`../../k8s/${accountFile}`, { namespace, name, serviceAccountName })
                .end()

            // Setup service account for job
            this.job.spec.template.spec.serviceAccountName = serviceAccountName
        } 
        finally {
            this.manager.status?.pop()
        }
    }

    // Same as AppEngine process templates
    async processTemplates() {
        try {
            this.manager.status?.push('Processing templates')

            // Handles several special case config options, like "$PUBLIC_FQDN"
            await this.processTemplate(this.documentHelper.configs, 'Processing configs templates')
            await this.processTemplate(this.documentHelper.secrets, 'Processing secrets templates')
        }
        finally {
            this.manager.status?.pop()
        }
    }

    /**
     * Expand configuration key names to be object paths.
     * 
     * For example:
     *  foo:bar: dummyval
     *  becomes
     *    foo:
     *      bar: dummyval
     * 
     * @param configs
     * @returns 
     */
    expandConfigs(configs) {
        const regex = /[:\.\[]/
        for(const key of Object.keys(configs)) {
            if (key.match(regex)) {
                const value = configs[key]
                delete configs[key]

                setByPath(configs, key.replace(':','.'), value)
            }
        }
        
        return configs
    }
}
