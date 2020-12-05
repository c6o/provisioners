import { ProvisionerManager } from '@provisioner/common'
import { AppEngineState, AppManifest, Helper } from '../../appObject'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { templates } from '../../templates/latest'
//import { applySql } from '../../templates/latest/features/mysql'
import createDebug from 'debug'

const debug = createDebug('@appengine:ObjectApplier')
export class ObjectApplier implements Applier {

    helper = new Helper()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async apply(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager) {

        state.startTimer('object-apply')

        const spec = manifest.provisioner
        const deployment = await templates.getDeploymentTemplate(spec.name, manifest.namespace, spec.image, spec.command, state.labels)

        // if (spec.link) {
        //     //we have features/dependancies to deal with, lets jump to that first
        //     await this.installFeatures(manifest.namespace, spec, manager)
        // }

        debug('applying secrets')
        await this.applySecrets(manifest, state, manager, deployment)
        debug('applying configs')
        await this.applyConfigs(manifest, state, manager, deployment)
        debug('applying ports')
        await this.applyPorts(manifest, state, manager, deployment)
        debug('applying volumes')
        await this.applyVolumes(manifest, state, manager, deployment)
        debug('applying deployment')
        await this.applyDeployment(manifest, state, manager, deployment)
        debug('done')

        state.endTimer('object-apply')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyDeployment(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager, deployment: any) {
        state.startTimer('apply-deployment')

        debug(`Installing the Deployment:${JSON.stringify(deployment)}`)
        this.helper.PrettyPrintJsonFile(deployment, `${manifest.appId}-deployment.json`)

        await manager.cluster
            .begin(`Installing the Deployment for ${manifest.displayName}`)
            .addOwner(manager.document)
            .upsert(deployment)
            .end()

        state.endTimer('apply-deployment')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyVolumes(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager, deployment: any) {
        state.startTimer('apply-volumes')

        if (manifest.provisioner.volumes?.length) {

            if (!deployment.spec.template.spec.containers[0].volumeMounts)
                deployment.spec.template.spec.containers[0].volumeMounts = []

            if (!deployment.spec.template.spec.volumes)
                deployment.spec.template.spec.volumes = []

            for (const item of manifest.provisioner.volumes) {

                if (item.size && item.size !== '') {
                    const pvc = templates.getPVCTemplate(item, manifest.namespace, state.labels)

                    debug(`Installing Volume Claim:${JSON.stringify(pvc)}`)
                    this.helper.PrettyPrintJsonFile(pvc, `${manifest.appId}-pvc.json`)

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

        state.endTimer('apply-volumes')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyPorts(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager, deployment: any) {
        state.startTimer('apply-ports')

        if (manifest.provisioner.ports?.length) {

            const service = templates.getPortTemplate(manifest.appId, manifest.namespace, state.labels)

            if (!deployment.spec.template.spec.containers[0].ports)
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
            this.helper.PrettyPrintJsonFile(service, `${manifest.appId}-service.json`)

            await manager.cluster
                .begin(`Installing the Networking Services for ${manifest.displayName}`)
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }

        state.endTimer('apply-ports')

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyConfigs(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager, deployment: any) {

        state.startTimer('apply-configs')

        if (!manifest.provisioner.configs?.length) manifest.provisioner.configs = []

        //provide some basic codezero app details to the provisioner
        manifest.provisioner.configs.push({ name: 'name', value: manifest.appId, env: 'CZ_APP' })
        manifest.provisioner.configs.push({ name: 'edition', value: manifest.edition, env: 'CZ_EDITION' })
        manifest.provisioner.configs.push({ name: 'instanceId', value: state.labels.instanceId, env: 'CZ_INSTANCE_ID' })

        const config = templates.getConfigTemplate(manifest.appId, manifest.namespace, state.labels)

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
        this.helper.PrettyPrintJsonFile(config, `${manifest.appId}-config.json`)

        await manager.cluster
            .begin(`Installing the Configuration Settings for ${manifest.displayName}`)
            .addOwner(manager.document)
            .upsert(config)
            .end()

        state.endTimer('apply-configs')

    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applySecrets(manifest: AppManifest, state: AppEngineState, manager: ProvisionerManager, deployment: any) {

        state.startTimer('apply-secrets')

        if (manifest.provisioner.secrets && manifest.provisioner.secrets.length > 0) {

            const secret = templates.getSecretTemplate(manifest.appId, manifest.namespace, state.labels)

            for (const item of manifest.provisioner.secrets) {

                if (!item.env || item.env === '') item.env = item.name

                let val = String(item.value)?.trim()
                if (val !== '') {
                    if (val.startsWith('$RANDOM')) {
                        if (val === '$RANDOM')
                            val = this.helper.makeRandom(10)
                        else {
                            if (val.indexOf(':') > 0) {
                                const len = Number(val.substr(val.indexOf(':') + 1))
                                val = this.helper.makeRandom(len)
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
            this.helper.PrettyPrintJsonFile(secret, `${manifest.appId}-secret.json`)

            await manager.cluster
                .begin(`Installing the Secrets for ${manifest.displayName}`)
                .addOwner(manager.document)
                .upsert(secret)
                .end()
        }

        state.endTimer('apply-secrets')
    }


}