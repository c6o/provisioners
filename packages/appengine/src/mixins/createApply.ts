import { KubeDocument } from '@c6o/kubeclient-contracts'
import { baseProvisionerType } from '../index'
import { ApplierFactory as applierFactory } from '../applying/'
import createDebug from 'debug'
import { AppEngineAppObject, AppManifest, TimingReporter, AppEngineState, Helper } from '../appObject'
import { keyValue } from '../contracts'
import * as templates from '../templates/'

const debug = createDebug('@appengine:createApply')

declare module '../' {
    export interface Provisioner {
        createDeployment: KubeDocument
    }
}
export const createApplyMixin = (base: baseProvisionerType) => class extends base {

    createDeployment: KubeDocument

    get createDeploymentContainer() { return this.createDeployment.spec.template.spec.containers[0] }
    get createDeploymentContainerEnvFrom() {
        if (this.createDeployment.spec.template.spec.containers[0].envFrom)
            this.createDeployment.spec.template.spec.containers[0].envFrom = []
        return this.createDeployment.spec.template.spec.containers[0].envFrom
    }

    pods(namespace, app) {
        return {
            kind: 'Pod',
            metadata: {
                namespace,
                labels: {
                    app
                }
            }
        }
    }

    async createApply() {
        try {
            this.manager.status?.push(`Applying App Engine to ${this.manifestHelper.name}`)

            // Handle templates
            await this.ensureCreateDeployment()
            await this.processTemplates()
            await this.createConfigs()
            await this.createSecrets()

            // Ports
            // Volumes

            // Deployments
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
        if (this.createDeployment)
            return
        this.createDeployment = await templates.getDeploymentTemplate(
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

            this.manager.cluster
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
            this.manager.status?.pop(skipped)
        }
    }

    async createSecrets() {
        let skipped = false
        try {
            if (!this.manifestHelper.hasConfigs) {
                skipped = true
                return
            }

            const createSecrets = templates.getSecretTemplate(
                this.manifestHelper.name,
                this.manifestHelper.namespace,
                this.manifestHelper.getComponentLabels()
            )

            this.manager.cluster
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
        // TODO: RobC
    }

    async applyServices() {
        let skipped = false
        try {
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

    helper = new Helper()
    async oldCreateApply() {
        const manifest = new AppEngineAppObject(this.manager.document)

        if (!this.state) {
            this.state = new AppEngineState(
                {
                    name: manifest.name,
                    appId: manifest.appId,
                    partOf: manifest.appId,
                    edition: manifest.edition,
                })
        }

        this.writeToLog('createApply - manifest', manifest)
        this.writeToLog('createApply - state', this.state)
        if (!this.state.publicDNS) {
            this.state.publicDNS = await this.helper.getApplicationDNS(this.manager, manifest.name, manifest.namespace)
            this.state.publicURI = await this.helper.getApplicationURI(this.manager, manifest.name, manifest.namespace)
        }

        this.state.startTimer('apply')
        await this.ensureServiceNamespacesExist()
        await this.installApp(manifest)
        await this.ensureAppIsRunning(manifest)
        this.state.endTimer('apply')
        new TimingReporter().report(this.state)
    }

    async installApp(manifest: AppManifest) {
        this.state.startTimer('install')
        const applierType = manifest.provisioner.applier || 'ObjectApplier'
        await applierFactory.getApplier(applierType).apply(manifest, this.state, this.manager)
        if ((manifest as any).fieldTypes) delete (manifest as any).fieldTypes
        this.state.endTimer('install')
    }

    async ensureAppIsRunning(manifest: AppManifest) {
        this.state.startTimer('watch-pod')
        await this.manager.cluster.
            begin(`Ensure ${manifest.displayName} services are running`)
            .beginWatch(this.pods(manifest.namespace, manifest.appId))
            .whenWatch(({ condition }) => condition.Ready === 'True', (processor) => {
                processor.endWatch()
            })
            .end()
        this.state.endTimer('watch-pod')
    }
}