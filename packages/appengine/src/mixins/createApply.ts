import { KubeDocument } from '@c6o/kubeclient-contracts'
import { baseProvisionerType } from '../index'
import createDebug from 'debug'
import { keyValue } from '../contracts'
import * as templates from '../templates/'

const debug = createDebug('@appengine:createApply')

declare module '../' {
    export interface Provisioner {
        createDeploymentDocument: KubeDocument
    }
}
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    createDeploymentDocument: KubeDocument

    get createDeploymentContainer() { return this.createDeploymentDocument.spec.template.spec.containers[0] }
    get createDeploymentContainerEnvFrom() {
        if (!this.createDeploymentDocument.spec.template.spec.containers[0].envFrom)
            this.createDeploymentDocument.spec.template.spec.containers[0].envFrom = []
        return this.createDeploymentDocument.spec.template.spec.containers[0].envFrom
    }

    async createApply() {
        try {
            this.manager.status?.push(`Applying App Engine to ${this.manifestHelper.name}`)

            await this.ensureCreateDeployment()

            // Handle templates
            await this.processTemplates()
            await this.createConfigs()
            await this.createSecrets()

            await this.createServices()
            await this.createVolumes()

            await this.createDeployment()
            await this.ensureAppIsRunning()
        }
        finally {
            this.manager.status?.pop()
        }
    }


    async processTemplates() {
        try {
            this.manager.status?.push('Processing templates')

            await this.processTemplate(this.manifestHelper.configs, 'Processing configs templates')
            await this.processTemplate(this.manifestHelper.secrets, 'Processing secrets templates')
        }
        finally {
            this.manager.status?.pop()
        }
    }

    async ensureCreateDeployment() {
        if (this.createDeploymentDocument)
            return
        this.createDeploymentDocument = await templates.getDeploymentTemplate(
            this.manifestHelper.name,
            this.manifestHelper.namespace,
            this.manifestHelper.image,
            this.manifestHelper.getComponentLabels(),
            this.manifestHelper.tag,
            this.manifestHelper.imagePullPolicy,
            this.manifestHelper.command,
        )
    }

    async createConfigs() {
        let skipped = false
        try {
            this.manager.status?.push('Installing configuration settings')

            if (!this.manifestHelper.hasConfigs) {
                skipped = true
                return
            }

            const createConfigMap = templates.getConfigTemplate(
                this.manifestHelper.name,
                this.manifestHelper.namespace,
                this.manifestHelper.configs as keyValue,
                this.manifestHelper.getComponentLabels()
            )

            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .upsert(createConfigMap)
                .end()

            this.createDeploymentContainerEnvFrom.push({
                configMapRef: {
                    name: createConfigMap.metadata.name
                }
            })

        }
        finally {
            debugger
            this.manager.status?.pop(skipped)
        }
    }

    async createSecrets() {
        let skipped = false
        try {
            this.manager.status?.push('Installing secret settings')

            if (!this.manifestHelper.hasConfigs) {
                skipped = true
                return
            }

            const createSecrets = templates.getSecretTemplate(
                this.manifestHelper.name,
                this.manifestHelper.namespace,
                this.manifestHelper.base64Secrets,
                this.manifestHelper.getComponentLabels()
            )

            await this.manager.cluster
                .begin()
                .addOwner(this.manager.document)
                .upsert(createSecrets)
                .end()

            this.createDeploymentContainerEnvFrom.push({
                secretRef: {
                    name: createSecrets.metadata.name
                }
            })

        }
        finally {
            this.manager.status?.pop(skipped)
        }
    }


    async createVolumes() {
        let skipped = false

        try {
            this.manager.status?.push('Installing volumes')

            if (!this.manifestHelper.hasVolumes) {
                skipped = true
                return
            }

        // TODO: RobC

        }
        finally {
            this.manager.status?.pop(skipped)
        }
    }

    async createServices() {
        let skipped = false
        try {
            this.manager.status?.push('Installing networking services')

            if (!this.manifestHelper.hasPorts) {
                skipped = true
                return
            }

            const createService = templates.getServiceTemplate(
                this.manifestHelper.name,
                this.manifestHelper.namespace,
                this.manifestHelper.getServicePorts(),
                this.manifestHelper.getComponentLabels()
            )

            debug('Installing Networking Services: %O', this.deployment)

            await this.manager.cluster
                .begin()
                    .addOwner(this.manager.document)
                    .upsert(createService)
                .end()

            this.createDeploymentContainer.ports = this.manifestHelper.getDeploymentPorts()
        }
        finally {
            this.manager.status?.pop(skipped)
        }
    }

    async createDeployment() {
        await this.manager.cluster
            .begin('Creating the deployment')
            .addOwner(this.manager.document)
            .upsert(this.createDeploymentDocument)
            .end()
    }

    async ensureAppIsRunning() {
        await this.manager.cluster.
            begin(`Ensure ${this.manifestHelper.name} services are running`)
            .beginWatch(templates.getPodTemplate(this.manifestHelper.name, this.manifestHelper.namespace))
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
    }
}