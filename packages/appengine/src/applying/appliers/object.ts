import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { IDebugger } from 'debug'


export class ObjectApplier implements Applier {

    async apply(namespace: string, spec: any, manager: ProvisionerManager, debug: IDebugger) {

        const deployment = await this.getDeployment(namespace, spec, debug)
        await this.applySecrets(namespace, spec, manager, debug, deployment)
        await this.applyConfigs(namespace, spec, manager, debug, deployment)
        await this.applyPorts(namespace, spec, manager, debug, deployment)
        await this.applyVolumes(namespace, spec, manager, debug, deployment)
        await this.applyDeployment(spec, manager, debug, deployment)

    }

    async applyDeployment(spec: any, manager: ProvisionerManager, debug: IDebugger, deployment: any) {

        debug('Installing the Deployment', deployment)

        await manager.cluster
            .begin('Installing the Deployment')
            .addOwner(manager.document)
            .upsert(deployment)
            .end()
    }

    async getDeployment(namespace: string, spec: any, debug: IDebugger) {
        return {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                namespace: namespace,
                name: spec.name,
                labels: {
                    app: spec.name,
                    'app.kubernetes.io/managed-by': 'codezero',
                    'system.codezero.io/app': spec.name,
                    'system.codezero.io/appengine': 'v1'
                }
            },
            spec: {
                selector: {
                    matchLabels: {
                        app: spec.name
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: spec.name,
                            'app.kubernetes.io/managed-by': 'codezero',
                            'system.codezero.io/app': 'name',
                            'system.codezero.io/appengine': 'v1'
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: spec.name,
                                image: spec.image,
                                imagePullPolicy: 'IfNotPresent',
                                env: []
                            }
                        ]
                    }
                }
            }
        }
    }


    async applyVolumes(namespace: string, spec: any, manager: ProvisionerManager, debug: IDebugger, deployment: any) {

        if (spec.volumes?.length) {

            deployment.spec.template.spec.containers[0].volumeMounts = []
            deployment.spec.template.spec.volumes = []

            for (const item of spec.volumes) {
                const pvc = {
                    kind: 'PersistentVolumeClaim',
                    apiVersion: 'v1',
                    metadata: {
                        name: item.name.toLowerCase(),
                        namespace: namespace,
                        labels: {
                            app: spec.name,
                            'system.codezero.io/app': spec.name,
                            'system.codezero.io/appengine': 'v1'
                        }
                    },
                    spec: {
                        accessModes: [
                            'ReadWriteOnce'
                        ],
                        resources: {
                            requests: {
                                storage: item.size
                            }
                        }
                    }
                }

                debug('Installing Volume Claim', pvc)

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

    async applyPorts(namespace: string, spec: any, manager: ProvisionerManager, debug: IDebugger, deployment: any) {

        if (spec.ports?.length) {
            const service = {
                apiVersion: 'v1',
                kind: 'Service',
                metadata: {
                    name: spec.name,
                    namespace: namespace,
                    labels: {
                        app: spec.name,
                        'app.kubernetes.io/managed-by': 'codezero',
                        'system.codezero.io/app': spec.name,
                        'system.codezero.io/appengine': 'v1'
                    }
                },
                spec: {
                    type: 'NodePort',
                    externalTrafficPolicy: 'Cluster',
                    ports: [],
                    selector: {
                        app: spec.name
                    }
                }
            }

            deployment.spec.template.spec.containers[0].ports = []

            for (const item of spec.ports) {

                // # Inside the cluster, what port does the service expose?
                // - port: 8080
                //Expose the service on the specified port internally within the cluster. That is, the service becomes visible on this port, and will send requests made to this port to the pods selected by the service.

                // # Which port do pods selected by this service expose?
                // - targetPort: 8080
                //This is the port on the pod that the request gets sent to. Your application needs to be listening for network requests on this port for the service to work.

                // export interface Port {
                //     name: string
                //     protocol: string
                //     port: number
                //     targetPort: number
                //     externalPort: number
                // }
                service.spec.ports.push({ name: item.name, port: item.port, targetPort: item.targetPort, protocol: item.protocol })
                deployment.spec.template.spec.containers[0].ports.push({ name: item.name, containerPort: item.port })
            }

            debug('Installing Networking Services', service)

            await manager.cluster
                .begin('Installing Networking Services')
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }


    }

    async applyConfigs(namespace: string, spec: any, manager: ProvisionerManager, debug: IDebugger, deployment: any) {

        if (spec.configs?.length) {

            const config = {
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    name: `${spec.name}configs`,
                    namespace: namespace,
                    labels: {
                        app: spec.name,
                        'system.codezero.io/app': spec.name,
                        'system.codezero.io/appengine': 'v1'
                    }
                },
                data: {}
            }


            for (const item of spec.configs) {
                if (!item.env || item.env === '') item.env = item.name
                config.data[item.name] = item.value
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

            debug('Applying configs:\n', deployment.spec.template.spec.containers[0].env)

            await manager.cluster
                .begin('Installing the Configuration Settings')
                .addOwner(manager.document)
                .upsert(config)
                .end()
        }
    }


    async applySecrets(namespace: string, spec: any, manager: ProvisionerManager, debug: IDebugger, deployment: any) {

        if (spec.secrets && spec.secrets.length > 0) {

            const secret = {
                apiVersion: 'v1',
                kind: 'Secret',
                metadata: {
                    name: `${spec.name}secrets`,
                    namespace: namespace,
                    labels: {
                        app: spec.name,
                        'system.codezero.io/app': spec.name,
                        'system.codezero.io/appengine': 'v1'
                    }
                },
                type: 'Opaque',
                data: {}
            }


            for (const item of spec.secrets) {
                if (!item.env || item.env === '') item.env = item.name
                const value = Buffer.from(item.value).toString('base64')
                secret.data[item.name] = value
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

            debug('Applying secrets:\n', deployment.spec.template.spec.containers[0].env)

            await manager.cluster
                .begin('Installing the Secrets')
                .addOwner(manager.document)
                .upsert(secret)
                .end()
        }
    }
}