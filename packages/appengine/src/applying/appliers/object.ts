import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { inspect } from 'util'
import { templates } from '../../templates/latest'
import createDebug from 'debug'
import { LabelsMetadata } from '../../parsing'
const debug = createDebug('@appengine:createInquire')

export class ObjectApplier implements Applier {

    async apply(namespace: string, spec: any, manager: ProvisionerManager) {

        if (!spec.metaData) {
            spec.metaData = {
                id: Math.random().toString(36).substring(6),
            } as LabelsMetadata
        }

        const deployment = await templates.getDeploymentTemplate(spec.name, namespace, spec.image, spec.metaData)
        await this.applySecrets(namespace, spec, manager, deployment)
        await this.applyConfigs(namespace, spec, manager, deployment)
        await this.applyPorts(namespace, spec, manager, deployment)
        await this.applyVolumes(namespace, spec, manager, deployment)
        await this.applyDeployment(spec, manager, deployment)

    }

    async applyDeployment(spec: any, manager: ProvisionerManager, deployment: any) {

        debug('Installing the Deployment', inspect(deployment))

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

                debug('Installing Volume Claim', inspect(pvc))

                await manager.cluster
                    .begin(`Installing Volume Claim: '${item.name}'`)
                    .addOwner(manager.document)
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

            debug('Installing Networking Services', inspect(service), inspect(deployment.spec.template.spec.containers[0].ports))

            await manager.cluster
                .begin('Installing Networking Services')
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }


    }

    async applyConfigs(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.config?.length) {

            const config = templates.getConfigTemplate(spec.name, namespace, spec.metaData)

            for (const item of spec.config) {
                if (!item.env || item.env === '') item.env = item.name
                config.data[item.name] = new String(item.value)

                if (item.env && item.env !== '' && item.env !== 'NONE') {
                    deployment.spec.template.spec.containers[0].env.push(
                        {
                            name: item.env,
                            valueFrom: {
                                configMapKeyRef: {
                                    name: `${spec.name}configs`,
                                    key: item.name
                                }
                            }
                        })
                }
            }

            debug('Installing configs:\n', inspect(deployment.spec.template.spec.containers[0].env))

            await manager.cluster
                .begin('Installing the Configuration Settings')
                .addOwner(manager.document)
                .upsert(config)
                .end()
        }
    }


    async applySecrets(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.secret && spec.secrets.length > 0) {

            const secret = templates.getSecretTemplate(spec.name, namespace, spec.metaData)


            for (const item of spec.secret) {
                if (!item.env || item.env === '') item.env = item.name
                const value = Buffer.from(new String(item.value)).toString('base64')
                secret.data[item.name] = value
                if (item.env && item.env !== '' && item.env !== 'NONE') {
                    deployment.spec.template.spec.containers[0].env.push(
                        {
                            name: item.env,
                            valueFrom: {
                                secretKeyRef: {
                                    name: `${spec.name}secrets`,
                                    key: item.name
                                }
                            }
                        })
                }
            }

            debug('Installing secrets:\n', inspect(deployment.spec.template.spec.containers[0].env))

            await manager.cluster
                .begin('Installing the Secrets')
                .addOwner(manager.document)
                .upsert(secret)
                .end()
        }
    }
}