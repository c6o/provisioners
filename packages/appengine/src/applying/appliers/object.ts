import { AppObject, ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { templates } from '../../templates/latest'
import { LabelsMetadata } from '../../parsing'
import { applySql } from '../../templates/latest/features/mysql'
import * as fs from 'fs'
import createDebug from 'debug'

const debug = createDebug('@appengine:ObjectApplier')
export class ObjectApplier implements Applier {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async apply(manifest: AppObject, manager: ProvisionerManager) {

        const spec = manifest.provisioner

        if (!manifest.state.labels) {
            manifest.state.labels = {
                instanceId: this.makeRandom(6),
                edition: spec.edition
            } as LabelsMetadata
        }
        if (!manifest.state.labels) manifest.state.labels = this.makeRandom(6)
        if (!manifest.state.labels) manifest.state.labels = spec.edition

        const deployment = await templates.getDeploymentTemplate(spec.name, manifest.namespace, spec.image, spec.command, manifest.state.labels)

        // if (spec.link) {
        //     //we have features/dependancies to deal with, lets jump to that first
        //     await this.installFeatures(manifest.namespace, spec, manager)
        // }

        debug('applying secrets')
        await this.applySecrets(manifest, manager, deployment)
        debug('applying configs')
        await this.applyConfigs(manifest, manager, deployment)
        debug('applying ports')
        await this.applyPorts(manifest, manager, deployment)
        debug('applying volumes')
        await this.applyVolumes(manifest, manager, deployment)
        debug('applying deployment')
        await this.applyDeployment(manifest, manager, deployment)
        debug('done')

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyDeployment(manifest: AppObject, manager: ProvisionerManager, deployment: any) {

        debug(`Installing the Deployment:${JSON.stringify(deployment)}`)
        this.PrettyPrintJsonFile(deployment, `${manifest.appId}-deployment.json`)


        manifest.state.timing.apply.deployment = { start: new Date() }

        await manager.cluster
            .begin(`Installing the Deployment for ${manifest.displayName}`)
            .addOwner(manager.document)
            .upsert(deployment)
            .end()

        manifest.state.timing.apply.deployment = { start: new Date() }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyVolumes(manifest: AppObject, manager: ProvisionerManager, deployment: any) {

        if (manifest.provisioner.volumes?.length) {

            if(!deployment.spec.template.spec.containers[0].volumeMounts)
                deployment.spec.template.spec.containers[0].volumeMounts = []

                if(!deployment.spec.template.spec.volumes)
                deployment.spec.template.spec.volumes = []

            for (const item of manifest.provisioner.volumes) {

                if (item.size && item.size !== '') {
                    const pvc = templates.getPVCTemplate(item, manifest.namespace, manifest.state.labels)

                    debug(`Installing Volume Claim:${JSON.stringify(pvc)}`)
                    this.PrettyPrintJsonFile(pvc, `${manifest.appId}-pvc.json`)

                    await manager.cluster
                        .begin(`Installing the Volume Claim for ${manifest.displayName}`)
                        //TODO: Advanced installer needs to choose the volumes to delete
                        .addOwner(manager.document)
                        .upsert(pvc)
                        .end()

                    deployment.spec.template.spec.volumes.push({ name: item.name, persistentVolumeClaim: { claimName: item.name } })
                }

                if (item.mountPath && item.mountPath !== '') {
                    const mount = { name: item.name, mountPath: item.mountPath, subPath: undefined }

                    if (item.subPath && item.subPath !== '')
                        mount.subPath = item.subPath
                    else
                        delete mount.subPath

                    deployment.spec.template.spec.containers[0].volumeMounts.push(mount)
                }
            }

        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyPorts(manifest: AppObject, manager: ProvisionerManager, deployment: any) {

        if (manifest.provisioner.ports?.length) {

            const service = templates.getPortTemplate(manifest.appId, manifest.namespace, manifest.state.labels)

            if(!deployment.spec.template.spec.containers[0].ports)
                deployment.spec.template.spec.containers[0].ports = []

            for (const item of manifest.provisioner.ports) {
                if (item.protocol) item.protocol = item.protocol.toUpperCase()
                service.spec.ports.push({ name: item.name, port: item.port, targetPort: item.targetPort, protocol: item.protocol })
                deployment.spec.template.spec.containers[0].ports.push({ name: item.name, containerPort: item.port })

                if (item.probe?.length) {
                    //we have probes
                    for (const probe of item.probe) {
                        if (!probe.port || probe.port <= 0) probe.port = item.port  //allow for a more terse syntax in the yaml; no need to specifiy the port, it will adopt the port from the parent instance

                        const template = templates.getProbeTemplate(probe)

                        if (template) {
                            debug('Probe will be applied to deployment container; template: ', template)
                            deployment.spec.template.spec.containers[0] = { ...deployment.spec.template.spec.containers[0], ...template }
                            debug('Probe applied to deployment container, container: ', deployment.spec.template.spec.containers[0])
                        }
                    }
                }
            }

            debug(`Installing Networking Services:${JSON.stringify(deployment)}|${JSON.stringify(deployment.spec.template.spec.containers[0].ports)}`,)
            this.PrettyPrintJsonFile(service, `${manifest.appId}-service.json`)

            await manager.cluster
                .begin(`Installing the Networking Services for ${manifest.displayName}`)
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }


    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyConfigs(manifest: AppObject, manager: ProvisionerManager, deployment: any) {

        if (!manifest.provisioner.configs?.length) manifest.provisioner.configs = []

        //provide some basic codezero app details to the provisioner
        manifest.provisioner.configs.push({ name: 'name', value: manifest.appId, env: 'CZ_APP' })
        manifest.provisioner.configs.push({ name: 'edition', value: manifest.edition, env: 'CZ_EDITION' })
        manifest.provisioner.configs.push({ name: 'instanceId', value: manifest.state.labels.instanceId, env: 'CZ_INSTANCE_ID' })

        const config = templates.getConfigTemplate(manifest.appId, manifest.namespace, manifest.state.labels)

        for (const item of manifest.provisioner.configs) {
            if (!item.env || item.env === '') item.env = item.name

            if (item.value === '$PUBLIC_DNS') {
                item.value = ''
            }

            config.data[item.name] = String(item.value)

            if (item.env !== 'NONE') {
                deployment.spec.template.spec.containers[0].env.push(
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

        debug(`Installing configs:${JSON.stringify(deployment.spec.template.spec.containers[0].env)}`,)
        this.PrettyPrintJsonFile(config, `${manifest.appId}-config.json`)

        await manager.cluster
            .begin(`Installing the Configuration Settings for ${manifest.displayName}`)
            .addOwner(manager.document)
            .upsert(config)
            .end()
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applySecrets(manifest: AppObject, manager: ProvisionerManager, deployment: any) {

        if (manifest.provisioner.secrets && manifest.provisioner.secrets.length > 0) {

            const secret = templates.getSecretTemplate(manifest.appId, manifest.namespace, manifest.state.labels)

            for (const item of manifest.provisioner.secrets) {

                if (!item.env || item.env === '') item.env = item.name

                let val = String(item.value)?.trim()
                if (val !== '') {
                    if (val.startsWith('$RANDOM')) {
                        if (val === '$RANDOM')
                            val = this.makeRandom(10)
                        else {
                            if (val.indexOf(':') > 0) {
                                const len = Number(val.substr(val.indexOf(':') + 1))
                                val = this.makeRandom(len)
                            }
                        }
                    }

                    const value = Buffer.from(val).toString('base64')
                    secret.data[item.name] = value
                    if (item.env !== '$NONE') {
                        deployment.spec.template.spec.containers[0].env.push(
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
            }

            debug(`Installing secrets:${JSON.stringify(deployment.spec.template.spec.containers[0].env)}`)
            this.PrettyPrintJsonFile(secret, `${manifest.appId}-secret.json`)

            await manager.cluster
                .begin(`Installing the Secrets for ${manifest.displayName}`)
                .addOwner(manager.document)
                .upsert(secret)
                .end()
        }

    }

    makeRandom(len) {
        let text = ''
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (let i = 0; i < len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length))

        return text
    }

    emitFile = true
    PrettyPrintJsonFile(json: any, file = 'debug.json') {
        if(!this.emitFile) return
        if (!file) file = 'debug.json'
        file = `${__dirname}/${file}`
        fs.writeFile(file, JSON.stringify(json, null, 2), i => { })
        debug(`${file} was written`)
    }
}