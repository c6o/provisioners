import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { templates } from '../../templates/latest'
import createDebug from 'debug'
import { LabelsMetadata } from '../../parsing'

const debug = createDebug('@appengine:ObjectApplier')

export class ObjectApplier implements Applier {

    async apply(namespace: string, spec: any, manager: ProvisionerManager) {

        if (!spec.metaData) {
            spec.metaData = {
                id: this.makeRandom(6),
                edition: spec.edition
            } as LabelsMetadata
        }
        if(!spec.metaData.id) spec.metaData.id = this.makeRandom(6)
        if(!spec.metaData.edition) spec.metaData.edition = spec.edition

        debug(`BOOSTRAP:${JSON.stringify(spec)}`)


        const deployment = await templates.getDeploymentTemplate(spec.name, namespace, spec.image, spec.metaData)
        debug(`deployment:${JSON.stringify(deployment)}`)

        debug('applying secrets')
        await this.applySecrets(namespace, spec, manager, deployment)
        debug('applying configs')
        await this.applyConfigs(namespace, spec, manager, deployment)
        debug('applying ports')
        await this.applyPorts(namespace, spec, manager, deployment)
        debug('applying volumes')
        await this.applyVolumes(namespace, spec, manager, deployment)
        debug('applying deployment')
        await this.applyDeployment(spec, manager, deployment)
        debug('done')

    }

    async applyDeployment(spec: any, manager: ProvisionerManager, deployment: any) {

        debug(`Installing the Deployment:${JSON.stringify(deployment)}`)

        await manager.cluster
            .begin('Installing the Deployment')
            .addOwner(manager.document)
            .upsert(deployment)
            .end()
    }

    async applyVolumes(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.volumes?.length) {

            deployment.spec.template.spec.containers[0].volumeMounts = []
            deployment.spec.template.spec.volumes = []

            for (const item of spec.volumes) {

                const pvc = templates.getPVCTemplate(item.name, item.size, spec.name, namespace, spec.metaData)

                debug(`Installing Volume Claim:${JSON.stringify(pvc)}`)

                await manager.cluster
                    .begin(`Installing Volume Claim: '${item.name}'`)
                    .addOwner(manager.document)  //TODO: Advanced installer needs to choose the volumes to delete
                    .upsert(pvc)
                    .end()

                deployment.spec.template.spec.containers[0].volumeMounts.push({ name: item.name, mountPath: item.mountPath })
                deployment.spec.template.spec.volumes.push({ name: item.name, persistentVolumeClaim: { claimName: item.name } })

            }

        }
    }

    async applyPorts(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.ports?.length) {

            const service = templates.getPortTemplate(spec.name, namespace, spec.metaData)

            deployment.spec.template.spec.containers[0].ports = []

            for (const item of spec.ports) {
                service.spec.ports.push({ name: item.name, port: item.port, targetPort: item.targetPort, protocol: item.protocol })
                deployment.spec.template.spec.containers[0].ports.push({ name: item.name, containerPort: item.port })
            }

            debug(`Installing Networking Services:${JSON.stringify(deployment)}|${JSON.stringify(deployment.spec.template.spec.containers[0].ports)}`,)

            await manager.cluster
                .begin('Installing Networking Services')
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }


    }

    async applyConfigs(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (!spec.configs?.length) spec.configs = []

        //provide some basic codezero app details to the provisioner
        spec.configs.push({ name: 'name', value: spec.name, env: 'CZ_APP' })
        spec.configs.push({ name: 'edition', value: spec.edition, env: 'CZ_EDITION' })

        const config = templates.getConfigTemplate(spec.name, namespace, spec.metaData)

        for (const item of spec.configs) {
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

        debug(`Installing configs:${JSON.stringify(deployment.spec.template.spec.containers[0].env)}`,)

        await manager.cluster
            .begin('Installing the Configuration Settings')
            .addOwner(manager.document)
            .upsert(config)
            .end()
    }


    async applySecrets(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.secrets && spec.secrets.length > 0) {

            const secret = templates.getSecretTemplate(spec.name, namespace, spec.metaData)

            for (const item of spec.secrets) {

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

            await manager.cluster
                .begin('Installing the Secrets')
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
}