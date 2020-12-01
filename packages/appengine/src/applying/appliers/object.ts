import { ProvisionerManager } from '@provisioner/common'
import { Applier } from '..'
import { Buffer } from 'buffer'
import { templates } from '../../templates/latest'
import { LabelsMetadata } from '../../parsing'
import { applySql } from '../../templates/latest/features/mysql'
import * as fs from 'fs'
import createDebug from 'debug'

const debug = createDebug('@appengine:ObjectApplier')
export class ObjectApplier implements Applier {

    emitFile = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async apply(namespace: string, spec: any, manager: ProvisionerManager) {

        if (!spec.metaData) {
            spec.metaData = {
                instanceId: this.makeRandom(6),
                edition: spec.edition
            } as LabelsMetadata
        }
        if (!spec.metaData.instanceId) spec.metaData.instanceId = this.makeRandom(6)
        if (!spec.metaData.edition) spec.metaData.edition = spec.edition

        debug(`BOOSTRAP:${JSON.stringify(spec)}`)

        const deployment = await templates.getDeploymentTemplate(spec.name, namespace, spec.image, spec.command, spec.metaData)

        if (spec.link) {
            //we have features/dependancies to deal with, lets jump to that first
            await this.installFeatures(namespace, spec, manager)
        }

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

    async installFeatures(namespace: string, spec: any, manager: ProvisionerManager) {

        // stages:
        // 1. Scan all "features", and create specs internally for each
        // 2. Take the "values" and apply them to each features spec
        // 3. Apply all features into the cluster
        // 4. Apply the "script" section to the feature.  This will be very hard coded
        // 5. Take the finished spec from each feature, and apply mappings to the App being installed
        // 6. Install the App requested

        // #Drawback, cant map values from one feature to another
        // #Scripts and their relationship with the feature will be very fixed (mysql, mariadb, etc..)  AppEngine will need to support all database types and such to execute these scripts against

        //make sure our current provisioner is listed as a dpeendancy so it can take part in the value and mappings
        if (!spec.configs) spec.configs = []
        if (!spec.secrets) spec.secrets = []

        this.PrettyPrintJsonFile(spec, 'pre-setup-spec.json')

        this.setupDependancies(spec)

        this.PrettyPrintJsonFile(spec, 'pre-link-spec.json')

        debug('----------------------------------VALUES----------------------------------')
        this.mapAndLink(spec.link.values, spec)
        debug('----------------------------------DONE VALUES----------------------------------')

        this.PrettyPrintJsonFile(spec, 'pre-install-spec.json')

        await this.installDependancies(spec.name, spec.link.dependancies, spec.metaData, manager, namespace)

        this.PrettyPrintJsonFile(spec, 'pre-map-spec.json')

        debug('----------------------------------MAPPING----------------------------------')
        this.mapAndLink(spec.link.mappings, spec)
        debug('----------------------------------DONE MAPPING----------------------------------')

        this.PrettyPrintJsonFile(spec)

    }
    setupDependancies(spec: any) {
        const fullAppName = `${spec.name}-${spec.metaData.edition}-${spec.metaData.instanceId}`
        for (const dependancy of spec.link.dependancies) {
            if (!dependancy.spec) dependancy.spec = { name: dependancy.name}
            if (!dependancy.spec.configs) dependancy.spec.configs = []
            if (!dependancy.spec.secrets) dependancy.spec.secrets = []
            if (!dependancy.spec.name) dependancy.spec.name = dependancy.name

            dependancy.spec.metaData = JSON.parse(JSON.stringify(spec.metaData))
            dependancy.spec.metaData.partOf = fullAppName
            dependancy.spec.metaData.component = 'database'
        }
        this.PrettyPrintJsonFile(spec, 'setup-dependancies.json')

    }


    async ensurePodIsRunning(manager: ProvisionerManager, namespace: string, app: string) {
        await manager.cluster
            .begin('Ensure pod is running')
            .beginWatch({
                kind: 'Pod',
                metadata: {
                    namespace,
                    labels: {
                        app
                    }
                }
            })
            .whenWatch(({ condition }) => condition.Ready == 'True', (processor, pod) => {
                processor.endWatch()
            })
            .end()
    }

    async installDependancies(rootName: string, dependancies: any, metaData: LabelsMetadata, manager: ProvisionerManager, namespace: string) {
        let database: any
        for (const dependancy of dependancies) {
            if(dependancy.name === 'mysql') database = dependancy
            if(dependancy.name === 'mariadb') database = dependancy

            dependancy.spec.configs.push({ name: 'DB_HOST', value: `${dependancy.name}.${namespace}` })
            const deployment = await templates.getDeploymentTemplate(dependancy.spec.name, namespace, dependancy.spec.image, dependancy.spec.command, dependancy.spec.metaData)
            debug('applying secrets')
            await this.applySecrets(namespace, dependancy.spec, manager, deployment)
            debug('applying configs')
            await this.applyConfigs(namespace, dependancy.spec, manager, deployment)
            debug('applying ports')
            await this.applyPorts(namespace, dependancy.spec, manager, deployment)
            debug('applying volumes')
            await this.applyVolumes(namespace, dependancy.spec, manager, deployment)
            debug('applying deployment')
            await this.applyDeployment(dependancy.spec, manager, deployment)
            debug('ensure dependancy is runing')
            await this.ensurePodIsRunning(manager, namespace, dependancy.name)
            debug('done')
        }

        if(database.spec.scripts) {

            debug('Waiting for 5 seconds to ensure database health...')

            await new Promise(resolve => setTimeout(resolve, 5000))

            const scripts = []
            for(const script of database.spec.scripts) {
                scripts.push(script.script)
            }

            applySql({
                host: database.spec.configs.filter(e=>e.name === 'DB_HOST')[0].value,
                port: database.spec.configs.filter(e=>e.name === 'DB_PORT')[0].value,
                password: database.spec.secrets.filter(e=>e.name === 'MYSQL_ROOT_PASSWORD')[0].value,
                user: 'root',
                sql: scripts,
                insecureAuth: true
            })
        }


    }

    mapAndLink(root: any, spec: any) {

        //iterate over all values
        for (const i of root) {

            const value = i.item
            const source = value.source
            const destination = value.destination

            //polyfill will our known values
            if (source.value) {
                if (typeof (source.value) === 'string' && source.value.startsWith('$RANDOM')) {
                    if (source.value === '$RANDOM')
                        source.value = this.makeRandom(10)
                    else {
                        if (source.value.indexOf(':') > 0) {
                            const len = Number(source.value.substr(source.value.indexOf(':') + 1))
                            source.value = this.makeRandom(len)
                        }
                    }
                }
            }

            let destinationSpec = undefined
            if (destination.name === spec.name) {
                destinationSpec = spec
            } else {
                //copy over from source to destination
                const featureLst = spec.link.dependancies.filter(e => e.name === destination.name)

                if (featureLst && featureLst.length > 0) {
                    if (!featureLst[0].spec) featureLst[0].spec = { configs: [], secrets: [] }
                    destinationSpec = featureLst[0].spec
                }
            }


            //we have a value and a place for it to go to
            if (destinationSpec) {

                //if the source was a straight value
                if (source.value) {
                    destinationSpec[destination.type].push({ name: destination.field, value: source.value })
                } else {
                    //need to dig the value out of the other provisioner itself

                    let sourceSpec = undefined

                    //if we need to get it from the root spec
                    if (source.name === spec.name) {
                        sourceSpec = spec
                    } else {
                        sourceSpec = spec.link.dependancies.filter(e => e.name === source.name)[0]?.spec
                    }


                    if (sourceSpec) {
                        const value = sourceSpec[destination.type].filter(e => e.name === source.field)[0]?.value
                        destinationSpec[destination.type].push({ name: destination.field, value })
                    }

                }

            }

        }


    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyDeployment(spec: any, manager: ProvisionerManager, deployment: any) {

        debug(`Installing the Deployment:${JSON.stringify(deployment)}`)
        this.PrettyPrintJsonFile(deployment, `${spec.name}-deployment.json`)

        await manager.cluster
            .begin(`Installing the Deployment for ${spec.name}`)
            .addOwner(manager.document)
            .upsert(deployment)
            .end()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyVolumes(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.volumes?.length) {

            if(!deployment.spec.template.spec.containers[0].volumeMounts)
                deployment.spec.template.spec.containers[0].volumeMounts = []

                if(!deployment.spec.template.spec.volumes)
                deployment.spec.template.spec.volumes = []

            for (const item of spec.volumes) {

                if (item.size && item.size !== '') {
                    const pvc = templates.getPVCTemplate(item, namespace, spec.metaData)

                    debug(`Installing Volume Claim:${JSON.stringify(pvc)}`)
                    this.PrettyPrintJsonFile(pvc, `${spec.name}-pvc.json`)

                    await manager.cluster
                        .begin(`Installing the Volume Claim for ${spec.name}`)
                        //TODO: Advanced installer needs to choose the volumes to delete
                        .addOwner(manager.document)
                        .upsert(pvc)
                        .end()

                    deployment.spec.template.spec.volumes.push({ name: item.name, persistentVolumeClaim: { claimName: item.name } })
                }

                if (item.mountPath && item.mountPath !== '') {
                    let mount = { name: item.name, mountPath: item.mountPath, subPath: undefined }

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
    async applyPorts(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (spec.ports?.length) {

            const service = templates.getPortTemplate(spec.name, namespace, spec.metaData)

            if(!deployment.spec.template.spec.containers[0].ports)
                deployment.spec.template.spec.containers[0].ports = []

            for (const item of spec.ports) {
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
            this.PrettyPrintJsonFile(service, `${spec.name}-service.json`)

            await manager.cluster
                .begin(`Installing the Networking Services for ${spec.name}`)
                .addOwner(manager.document)
                .upsert(service)
                .end()
        }


    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async applyConfigs(namespace: string, spec: any, manager: ProvisionerManager, deployment: any) {

        if (!spec.configs?.length) spec.configs = []

        //provide some basic codezero app details to the provisioner
        spec.configs.push({ name: 'name', value: spec.name, env: 'CZ_APP' })
        spec.configs.push({ name: 'edition', value: spec.edition, env: 'CZ_EDITION' })
        spec.configs.push({ name: 'instanceId', value: spec.metaData.instanceId, env: 'CZ_INSTANCE_ID' })

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

        if(spec.name === 'mysql') {

            const configAuth = {
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                    namespace,
                    name: 'mysql-config',
                    labels: {
                        app: spec.name
                    }
                },
                data: {
                    'default_auth': '[mysqld]\ndefault_authentication_plugin=mysql_native_password'
                }
            }

            await manager.cluster
                .begin('Installing mysql specific configuration')
                .addOwner(manager.document)
                .upsert(configAuth)
                .end()

            if(!deployment.spec.template.spec.volumes)
                deployment.spec.template.spec.volumes = []

            if(!deployment.spec.template.spec.containers[0].volumeMounts)
                deployment.spec.template.spec.containers[0].volumeMounts = []


            deployment.spec.template.spec.volumes.push({ name: 'mysql-config-volume', configMap: { name: 'mysql-config' }})
            deployment.spec.template.spec.containers[0].volumeMounts.push({ name: 'mysql-config-volume', mountPath: '/etc/mysql/conf.d/default_auth.cnf', subPath: 'default_auth' })

        }

        debug(`Installing configs:${JSON.stringify(deployment.spec.template.spec.containers[0].env)}`,)
        this.PrettyPrintJsonFile(config, `${spec.name}-config.json`)

        await manager.cluster
            .begin(`Installing the Configuration Settings for ${spec.name}`)
            .addOwner(manager.document)
            .upsert(config)
            .end()
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            this.PrettyPrintJsonFile(secret, `${spec.name}-secret.json`)

            await manager.cluster
                .begin(`Installing the Secrets for ${spec.name}`)
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

    PrettyPrintJsonFile(json: any, file = 'debug.json') {
        if(!this.emitFile) return
        if (!file) file = 'debug.json'
        fs.writeFile(`./packages/provisioners/packages/appengine/out/${file}`, JSON.stringify(json, null, 2), i => { })
        debug(`${__dirname}/packages/provisioners/packages/appengine/out/${file} was written`)
    }

}