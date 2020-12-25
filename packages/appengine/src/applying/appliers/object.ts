import { ProvisionerManager } from '@provisioner/common'
import { AppEngineState, AppManifest, Helper } from '../../appObject'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { templates } from '../../templates/latest'
//import { applySql } from '../../templates/latest/features/mysql'
import createDebug from 'debug'

const debug = createDebug('@appengine:ObjectApplier')
export class ObjectApplier implements Applier {

    DEFAULT_RANDOM_LENGTH = 10
    helper = new Helper()

    manifest: AppManifest
    state: AppEngineState
    manager: ProvisionerManager
    deployment: any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async apply(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager) {
        try {
            state.startTimer('object-apply')

            const deployment = await templates.getDeploymentTemplate(
                manifest.name,
                manifest.namespace,
                manifest.provisioner.image,
                state.labels,
                manifest.provisioner.tag,
                manifest.provisioner.imagePullPolicy,
                manifest.provisioner.command,
            )

            if (!state.publicDNS) {
                state.publicDNS = await this.helper.getApplicationDNS(manager, manifest.name, manifest.namespace)
                state.publicURI = await this.helper.getApplicationURI(manager, manifest.name, manifest.namespace)
            }


            // if (spec.link) {
            //     //we have features/dependancies to deal with, lets jump to that first
            //     await this.installFeatures(manifest.namespace, spec, manager)
            // }

            debug('applying secrets')
            await this.applySecrets()
            debug('applying configs')
            await this.applyConfigs()
            debug('applying ports')
            await this.applyPorts()
            debug('applying volumes')
            await this.applyVolumes()
            debug('applying deployment')
            await this.applyDeployment()
            debug('done')

            state.endTimer('object-apply')
        } catch (e) {
            debug('APPX apply', JSON.stringify(e))
            throw e
        }

        this.manifest = manifest
        this.state = state
        this.manager = manager

        state.startTimer('object-apply')

        this.deployment = await templates.getDeploymentTemplate(
            manifest.name,
            manifest.namespace,
            manifest.provisioner.image,
            state.labels,
            manifest.provisioner.tag,
            manifest.provisioner.imagePullPolicy,
            manifest.provisioner.command,
        )

        // if (spec.link) {
        //     //we have features/dependancies to deal with, lets jump to that first
        //     await this.installFeatures(manifest.namespace, spec, manager)
        // }

        await this.applySecrets()
        await this.applyConfigs()
        await this.applyPorts()
        await this.applyVolumes()
        await this.applyDeployment()

        state.endTimer('object-apply')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyDeployment() {
        this.state.startTimer('apply-deployment')
        debug('Installing the Deployment: %j', this.deployment)
        await this.manager.cluster
            .begin(`Installing the Deployment for ${this.manifest.displayName}`)
            .addOwner(this.manager.document)
            .upsert(this.deployment)
            .end()
        this.state.endTimer('apply-deployment')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyVolumes() {
        this.state.startTimer('apply-volumes')
        if (this.manifest.provisioner.volumes?.length) {

            if (!this.deployment.spec.template.spec.containers[0].volumeMounts)
                this.deployment.spec.template.spec.containers[0].volumeMounts = []

            if (!this.deployment.spec.template.spec.volumes)
                this.deployment.spec.template.spec.volumes = []

            for (const item of this.manifest.provisioner.volumes) {

                if (item.size && item.size !== '') {
                    const pvc = templates.getPVCTemplate(item, this.manifest.namespace, this.state.labels)

                    debug('Installing Volume Claim: %O', pvc)
                    await this.manager.cluster
                        .begin(`Installing the Volume Claim for ${this.manifest.displayName}`)
                        //TODO: Advanced installer needs to choose the volumes to delete
                        .addOwner(this.manager.document)
                        .upsert(pvc)
                        .end()

                    this.deployment.spec.template.spec.volumes.push({ name: item.name, persistentVolumeClaim: { claimName: item.name } })
                }

                if (item.mountPath && item.mountPath !== '') {
                    const mount = { name: item.name, mountPath: item.mountPath, subPath: undefined }

                    if (item.subPath && item.subPath !== '')
                        mount.subPath = item.subPath
                    else
                        delete mount.subPath

                    this.deployment.spec.template.spec.containers[0].volumeMounts.push(mount)
                }
            }

        }
        this.state.endTimer('apply-volumes')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyPorts() {
        this.state.startTimer('apply-ports')
        if (this.manifest.provisioner.ports?.length) {

            const service = templates.getPortTemplate(this.manifest.appId, this.manifest.namespace, this.state.labels)

            if (!this.deployment.spec.template.spec.containers[0].ports)
                this.deployment.spec.template.spec.containers[0].ports = []

            for (const item of this.manifest.provisioner.ports) {
                if (item.protocol) item.protocol = item.protocol.toUpperCase()
                service.spec.ports.push({ name: item.name, port: item.port, targetPort: item.targetPort, protocol: item.protocol })
                this.deployment.spec.template.spec.containers[0].ports.push({ name: item.name, containerPort: item.port })

                if (item.probe?.length) {
                    //we have probes
                    for (const probe of item.probe) {
                        if (!probe.port || probe.port <= 0) probe.port = item.port  //allow for a more terse syntax in the yaml; no need to specifiy the port, it will adopt the port from the parent instance

                        const template = templates.getProbeTemplate(probe)

                        if (template) {
                            debug('Probe will be applied to deployment container; template', template)
                            this.deployment.spec.template.spec.containers[0] = { ...this.deployment.spec.template.spec.containers[0], ...template }
                            debug('Probe applied to deployment container, container', this.deployment.spec.template.spec.containers[0])
                        }
                    }
                }
            }

            debug('Installing Networking Services: %O', this.deployment)

            await this.manager.cluster
                .begin(`Installing the Networking Services for ${this.manifest.displayName}`)
                .addOwner(this.manager.document)
                .upsert(service)
                .end()
        }
        this.state.endTimer('apply-ports')
    }

    convertTemplatedValue(value: any, state: AppEngineState) {

        if (!value) return

        if (typeof value !== 'string') value = `${value}`  //force our datatype

        if (state.publicURI && value.indexOf('$PUBLIC_DNS') >= 0) {
            value = value.replace('$PUBLIC_DNS', state.publicDNS)
        }
        if (state.publicURI && value.indexOf('$PUBLIC_URI') >= 0) {
            value = value.replace('$PUBLIC_URI', state.publicURI)
        }
        if (value.indexOf('$RANDOM') >= 0) {
            if (value === '$RANDOM')
                value = this.helper.makeRandom(this.DEFAULT_RANDOM_LENGTH)
            else {
                if (value.indexOf(':') > 0) {
                    const len = Number(value.substr(value.indexOf(':') + 1))
                    value = this.helper.makeRandom(len)
                }
            }
        }
        return value
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyConfigs() {

        this.state.startTimer('apply-configs')
        if (!this.manifest.provisioner.configs?.length) this.manifest.provisioner.configs = []

        //provide some basic codezero app details to the provisioner
        this.manifest.provisioner.configs.push({ name: 'name', value: this.state.labels.appId, env: 'CZ_APP' })
        this.manifest.provisioner.configs.push({ name: 'edition', value: this.state.labels.edition, env: 'CZ_EDITION' })
        this.manifest.provisioner.configs.push({ name: 'instanceId', value: this.state.labels.instanceId, env: 'CZ_INSTANCE_ID' })

        const config = templates.getConfigTemplate(this.manifest.appId, this.manifest.namespace, this.state.labels)

        debug(`Setting up configs:${JSON.stringify(config)}`)


        for (const item of this.manifest.provisioner.configs) {
            if (!item.env || item.env === '') item.env = item.name

            debug(`Setting up configs: ${item.name} ${item.value}`)
            item.value = this.convertTemplatedValue(item.value, this.state)


            config.data[item.name] = String(item.value)
            if (item.env !== 'NONE') {
                this.deployment.spec.template.spec.containers[0].env.push(
                    {
                        name: item.env,
                        valueFrom: {
                            configMapKeyRef: {
                                name: config.metadata.name,
                                key: item.name
                            }
                        }
                    })
                }
        }

        //#region linkage

        // if(spec.name === 'mysql') {

        //     const configAuth = {
        //         apiVersion: 'v1',
        //         kind: 'ConfigMap',
        //         metadata: {
        //             namespace,
        //             name: 'mysql-config',
        //             labels: {
        //                 app: spec.name
        //             }
        //         },
        //         data: {
        //             'default_auth': '[mysqld]\ndefault_authentication_plugin=mysql_native_password'
        //         }
        //     }

        //     await manager.cluster
        //         .begin('Installing mysql specific configuration')
        //         .addOwner(manager.document)
        //         .upsert(configAuth)
        //         .end()

        //     if(!deployment.spec.template.spec.volumes)
        //         deployment.spec.template.spec.volumes = []

        //     if(!deployment.spec.template.spec.containers[0].volumeMounts)
        //         deployment.spec.template.spec.containers[0].volumeMounts = []


        //     deployment.spec.template.spec.volumes.push({ name: 'mysql-config-volume', configMap: { name: 'mysql-config' }})
        //     deployment.spec.template.spec.containers[0].volumeMounts.push({ name: 'mysql-config-volume', mountPath: '/etc/mysql/conf.d/default_auth.cnf', subPath: 'default_auth' })

        // }
        //#endregion

        debug(`Installing configs:${JSON.stringify(this.deployment.spec.template.spec.containers[0].env)}`)
        await this.manager.cluster
            .begin(`Installing the Configuration Settings for ${this.manifest.displayName}`)
            .addOwner(this.manager.document)
            .upsert(config)
            .end()

            this.state.endTimer('apply-configs')
        // if(spec.name === 'mysql') {

        //     const configAuth = {
        //         apiVersion: 'v1',
        //         kind: 'ConfigMap',
        //         metadata: {
        //             namespace,
        //             name: 'mysql-config',
        //             labels: {
        //                 app: spec.name
        //             }
        //         },
        //         data: {
        //             'default_auth': '[mysqld]\ndefault_authentication_plugin=mysql_native_password'
        //         }
        //     }

        //     await manager.cluster
        //         .begin('Installing mysql specific configuration')
        //         .addOwner(manager.document)
        //         .upsert(configAuth)
        //         .end()

        //     if(!deployment.spec.template.spec.volumes)
        //         deployment.spec.template.spec.volumes = []

        //     if(!deployment.spec.template.spec.containers[0].volumeMounts)
        //         deployment.spec.template.spec.containers[0].volumeMounts = []


        //     deployment.spec.template.spec.volumes.push({ name: 'mysql-config-volume', configMap: { name: 'mysql-config' }})
        //     deployment.spec.template.spec.containers[0].volumeMounts.push({ name: 'mysql-config-volume', mountPath: '/etc/mysql/conf.d/default_auth.cnf', subPath: 'default_auth' })

        // }

        debug('Installing configs: %O', this.deployment.spec.template.spec.containers[0].env)
        await this.manager.cluster
            .begin(`Installing the Configuration Settings for ${this.manifest.displayName}`)
                .addOwner(this.manager.document)
                .upsert(config)
            .end()

        this.state.endTimer('apply-configs')
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applySecrets() {
        this.state.startTimer('apply-secrets')

        if (this.manifest.provisioner?.secrets?.length > 0) {

            const secret = templates.getSecretTemplate(this.manifest.appId, this.manifest.namespace, this.state.labels)

            for (const item of this.manifest.provisioner.secrets) {


                item.value = this.convertTemplatedValue(item.value, this.state)
                if (!item.env || item.env === '') item.env = item.name

                const value = Buffer.from(item.value).toString('base64')
                secret.data[item.name] = value
                if (item.env !== '$NONE') {
                    this.deployment.spec.template.spec.containers[0].env.push(
                        {
                            name: item.env,
                            valueFrom: {
                                secretKeyRef: {
                                    name: secret.metadata.name,
                                    key: item.name
                                }
                            }
                        })
                }
            }

            debug('Installing secrets %O', this.deployment.spec.template.spec.containers[0].env)

            await this.manager.cluster
                .begin(`Installing the Secrets for ${this.manifest.displayName}`)
                .addOwner(this.manager.document)
                .upsert(secret)
                .end()
        }

        this.state.endTimer('apply-secrets')
    }
}