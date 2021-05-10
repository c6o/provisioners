import { Resource, keyValue } from '@c6o/kubeclient-contracts'
import { baseProvisionerType } from '../index'
import createDebug from 'debug'
import * as templates from '../templates/'

const debug = createDebug('@appengine:createApply')

declare module '../' {
    export interface Provisioner {
        createDeploymentDocument: Resource
    }
}
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    createDeploymentDocument: Resource

    get createDeploymentVolumes() {
        return this.createDeploymentDocument.spec.template.spec.volumes = this.createDeploymentDocument.spec.template.spec.volumes || []
    }
    get createDeploymentVolumeMounts() {
        return this.createDeploymentContainer.volumeMounts = this.createDeploymentContainer.volumeMounts || []
    }
    get createDeploymentContainer() {
        return this.createDeploymentDocument.spec.template.spec.containers[0]
    }
    get createDeploymentContainerEnvFrom() {
        return this.createDeploymentDocument.spec.template.spec.containers[0].envFrom = this.createDeploymentDocument.spec.template.spec.containers[0].envFrom || []
    }

    async createApply() {
        try {
            super.status?.push(`Applying App Engine to ${this.documentHelper.name}`)

            await this.ensureCreateDeployment()

            // Handle templates
            await this.processTemplates()
            await this.createConfigs()
            await this.createSecrets()

            await this.createSecretRefs()
            await this.createConfigMapRefs()

            await this.createServices()
            await this.createVolumes()

            await this.createDeployment()
            await this.ensureAppIsRunning()
        }
        finally {
            super.status?.pop()
        }
    }


    async processTemplates() {
        try {
            super.status?.push('Processing templates')

            await this.processTemplate(this.documentHelper.configs, 'Processing configs templates')
            await this.processTemplate(this.documentHelper.secrets, 'Processing secrets templates')
        }
        finally {
            super.status?.pop()
        }
    }

    async ensureCreateDeployment() {
        if (this.createDeploymentDocument)
            return
        this.createDeploymentDocument = await templates.getDeploymentTemplate(
            this.documentHelper.name,
            this.documentHelper.namespace,
            this.documentHelper.image,
            this.documentHelper.componentLabels,
            this.documentHelper.tag,
            this.documentHelper.imagePullPolicy,
            this.documentHelper.command
        )
    }

    async createConfigs() {
        let skipped = false
        try {
            super.status?.push('Installing configuration settings')

            if (!this.documentHelper.hasConfigs) {
                skipped = true
                return
            }

            const configs = {}
            for(const key of Object.keys(this.documentHelper.configs)) {
                // Must be string, even if originally a boolean or number.
                configs[key] = String(this.documentHelper.configs[key])
            }

            const createConfigMap = templates.getConfigTemplate(
                this.documentHelper.name,
                this.documentHelper.namespace,
                configs
            )

            await super.cluster
                .begin()
                .addOwner(super.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createConfigMap)
                .end()

            this.createDeploymentContainerEnvFrom.push({
                configMapRef: {
                    name: createConfigMap.metadata.name
                }
            })

        }
        finally {
            super.status?.pop(skipped)
        }
    }

    async createSecrets() {
        let skipped = false
        try {
            super.status?.push('Installing secret settings')

            if (!this.documentHelper.hasSecrets) {
                skipped = true
                return
            }

            const base64Secrets: keyValue = {}
            for (const key in this.documentHelper.secrets)
                base64Secrets[key] = Buffer.from(this.documentHelper.secrets[key]).toString('base64')

            const createSecrets = templates.getSecretTemplate(
                this.documentHelper.name,
                this.documentHelper.namespace,
                base64Secrets
            )

            await super.cluster
                .begin()
                .addOwner(super.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createSecrets)
                .end()

            this.createDeploymentContainerEnvFrom.push({
                secretRef: {
                    name: createSecrets.metadata.name
                }
            })

        }
        finally {
            super.status?.pop(skipped)
        }
    }

    async createConfigMapRefs() {
        let skipped = false
        try {
            super.status?.push('Installing configMap refs')

            if (!this.documentHelper.hasConfigMapRefs) {
                skipped = true
                return
            }

            const configMapRefs = this.documentHelper.configMapRefs.map(name => ({ configMapRef: { name } }))
            this.createDeploymentContainerEnvFrom.push(...configMapRefs)

        }
        finally {
            super.status?.pop(skipped)
        }
    }

    async createSecretRefs() {
        let skipped = false
        try {
            super.status?.push('Installing secret refs')

            if (!this.documentHelper.hasSecretRefs) {
                skipped = true
                return
            }

            const secretRefs = this.documentHelper.secretRefs.map(name => ({ secretRef: { name } }))
            this.createDeploymentContainerEnvFrom.push(...secretRefs)
        }
        finally {
            super.status?.pop(skipped)
        }
    }


    async createVolumes() {
        let skipped = false

        try {
            super.status?.push('Installing volumes')

            if (!this.documentHelper.hasVolumes) {
                skipped = true
                return
            }

            // TODO: RobC
            for (const volume of this.documentHelper.volumes) {

                //k8s likes lowercase volume names
                volume.name = volume.name.toLowerCase()

                const createVolume = templates.getPVCTemplate(
                    volume,
                    this.documentHelper.namespace
                )

                await super.cluster
                    .begin()
                    .addOwner(super.document)
                    .mergeWith(this.documentHelper.appComponentMergeDocument)
                    .upsert(createVolume)
                    .end()

                this.createDeploymentVolumes.push({ name: volume.name, persistentVolumeClaim: { claimName: volume.name } })

                if (volume.mountPath) {
                    const mount: any = { name: volume.name, mountPath: volume.mountPath }
                    if (volume.subPath) mount.subPath = volume.subPath
                    this.createDeploymentVolumeMounts.push(mount)
                }
            }
        }
        finally {
            super.status?.pop(skipped)
        }
    }

    async createServices() {
        let skipped = false
        try {
            super.status?.push('Installing networking services')

            if (!this.documentHelper.hasPorts) {
                skipped = true
                return
            }

            const createService = templates.getServiceTemplate(
                this.documentHelper.name,
                this.documentHelper.namespace,
                this.documentHelper.getServicePorts()
            )

            await super.cluster
                .begin()
                .addOwner(super.document)
                .mergeWith(this.documentHelper.appComponentMergeDocument)
                .upsert(createService)
                .end()

            this.createDeploymentContainer.ports = this.documentHelper.getDeploymentPorts()
        }
        finally {
            super.status?.pop(skipped)
        }
    }

    async createDeployment() {
        await super.cluster
            .begin('Creating the deployment')
            .addOwner(super.document)
            .upsert(this.createDeploymentDocument)
            .end()
    }

    async ensureAppIsRunning() {
        await super.cluster.
            begin(`Ensure ${this.documentHelper.name} services are running`)
            .beginWatch(templates.getPodTemplate(this.documentHelper.name, this.documentHelper.namespace))
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}
