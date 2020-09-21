import { baseProvisionerType } from '../index'
import { Buffer } from 'buffer'

export const createInquireMixin = (base: baseProvisionerType) => class extends base {

    //#region  config and secrets

    async askConfig(args, automated) {


        const configs = this.parseConfigSecrets(args, 'config')

        if (configs && configs.length > 0 || automated) return configs

        let responses = { hasConfig: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfig',
                    message: 'Would you like to add a configuration parameter?',
                    default: false,
                }
            ])

            if (responses.hasConfig) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'configName',
                        message: 'What is configuration parameter name?',
                    },
                    {
                        type: 'input',
                        name: 'configValue',
                        message: 'What is configuration parameter value?',
                    },
                    {
                        type: 'input',
                        name: 'envName',
                        message: 'Docker environment variable name (optional)?',
                    }
                ])
                configs.push({ name: configResponses.configName, value: configResponses.configValue, env: configResponses.envName })
            }
        } while (responses.hasConfig)

        return configs

    }

    async askSecrets(args, automated) {

        const secrets = this.parseConfigSecrets(args, 'secret')

        if (secrets && secrets.length > 0 || automated) return secrets

        let responses = { hasSecret: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasSecret',
                    message: 'Would you like to add a secret?',
                    default: false,
                }
            ])

            if (responses.hasSecret) {

                const secretResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'secretName',
                        message: 'What is secret name?',
                    },
                    {
                        type: 'input',
                        name: 'secretValue',
                        message: 'What is secret value?',
                    },
                    {
                        type: 'input',
                        name: 'envName',
                        message: 'Docker environment variable name (optional)?',
                    }

                ])
                secrets.push({ name: secretResponses.secretName, value: secretResponses.secretValue, env: secretResponses.envName })
            }
        } while (responses.hasSecret)

        return secrets

    }

    parseConfigSecrets(args, name) {

        const results = []
        const rawValues = args[name] || this.spec[name]

        if (rawValues) {
            if (typeof rawValues == 'string') {
                results.push(this.parseSingle(rawValues))
            } else {
                for (const single of rawValues) {
                    results.push(this.parseSingle(single))
                }
            }
        }

        return results
    }

    parseSingle(single: string) {
        const pos = single.indexOf(':')
        let value = { name: '', value: '', env: '' }

        if (pos > 0) {
            value.name = single.substr(0, pos)
            const right = single.substr(pos + 1)
            const comma = right.indexOf(',')
            if (comma > 0) {
                value.value = right.substr(0, comma)
                value.env = right.substr(comma + 1)
            } else {
                value.value = right
            }
        }
        return value
    }
    //#endregion

    //#region  ports
    parseSinglePort(portSpec) {
        //portNumber/portName/targetPort
        //80/http/http
        const items = portSpec.split('/')
        if (items.length == 1) return { number: Number(items[0]), name: 'http', targetPort: 'http' }
        if (items.length == 2) return { number: Number(items[0]), name: items[1], targetPort: items[1] }
        if (items.length >= 3) return { number: Number(items[0]), name: items[1], targetPort: items[2] }

    }
    parsePorts(args) {

        const results = []
        const rawValues = args.port || this.spec.port

        if (!rawValues || rawValues == '') return []

        if (typeof (rawValues) == 'string') {
            //portNumber/portName/targetPort
            //80/http/http
            results.push(this.parseSinglePort(rawValues))
        } else {
            //['80/http/http', '1883/mosquitto/tcp']
            for (const p of rawValues) {
                results.push(this.parseSinglePort(p))
            }
        }

        return results
    }

    async askPorts(args, automated) {


        const ports = this.parsePorts(args)


        if (ports && ports.length > 0 || automated) return ports

        let responses = { hasPorts: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasPorts',
                    message: 'Would you like to add an exposed port?',
                    default: false,
                }
            ])

            if (responses.hasPorts) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'input',
                        name: 'number',
                        default: 8080,
                        message: 'What is the internal port number on the container?',
                    },
                    {
                        type: 'input',
                        name: 'name',
                        default: 'http',
                        message: 'What is port name?',
                    },
                    {
                        type: 'input',
                        name: 'targetPort',
                        default: 'http',
                        message: 'What is targetPort?',
                    }
                ])
                ports.push({ number: configResponses.number, name: configResponses.name, targetPort: configResponses.targetPort })
            }
        } while (responses.hasPorts)

        return ports

    }
    //#endregion

    //#region  volumes
    parseSingleVolume(portSpec) {
        //size:path
        //5Gi:/etc/config/
        const items = portSpec.split(':')
        const volume = { size: items[0], mountPath: items[1], name: 'data' }
        volume.name = `data-${Math.random().toString(36).substring(7)}`
        return volume

    }
    parseVolumes(args) {

        const results = []
        const rawValues = args.volume || this.spec.volume

        if (!rawValues || rawValues == '') return []

        if (typeof (rawValues) == 'string') {
            results.push(this.parseSingleVolume(rawValues))
        } else {
            for (const p of rawValues) {
                results.push(this.parseSingleVolume(p))
            }
        }

        return results
    }

    async askVolumes(args, automated) {

        const storageChoices = ['1Gi', '2Gi', '5Gi', '10Gi', '20Gi', '50Gi', '100Gi']

        const volumes = this.parseVolumes(args)

        if (volumes && volumes.length > 0 || automated) return volumes

        let responses = { hasVolumes: false }

        do {
            responses = await this.manager.inquirer?.prompt([
                {
                    type: 'confirm',
                    name: 'hasVolumes',
                    message: 'Would you like to add a persistent volume?',
                    default: false,
                }
            ])

            if (responses.hasVolumes) {

                const configResponses = await this.manager.inquirer?.prompt([
                    {
                        type: 'list',
                        name: 'storageSize',
                        message: 'What size data volume would you like to provision?',
                        choices: storageChoices,
                        default: '5Gi'
                    },
                    {
                        type: 'input',
                        name: 'mountPath',
                        default: '/var',
                        message: 'What path do you want this volume mounted at?',
                    }
                ])

                const volume = { size: configResponses.storageSize, mountPath: configResponses.mountPath, name: 'data' }
                volume.name = `data-${Math.random().toString(36).substring(7)}`
                volumes.push(volume)
            }
        } while (responses.hasVolumes)

        return volumes

    }
    //#endregion


    //#region  main
    async createInquire(args) {


        const answers = {
            image: args['image'] || this.spec.image,
            name: args['name'] || this.spec.name,
        }

        const automated = args["automated"] || this.spec.automated

        const responses = await this.manager.inquirer?.prompt([
            {
                type: 'input',
                name: 'image',
                message: 'Which docker image would you like to use?',
                default: 'xperimental/goecho:v1.7',
                validate: (image) => (image !== '' ? true : '')
            },
            {
                type: 'input',
                name: 'name',
                message: 'What would you like to name this deployment?',
                default: 'echoserver',
                validate: (name) => (name !== '' ? true : '')
            }
        ], answers)

        this.spec.image = responses.image
        this.spec.name = responses.name
        this.spec.edition = this.edition

        this.spec.ports = await this.askPorts(args, automated)
        this.spec.secrets = await this.askSecrets(args, automated)
        this.spec.configs = await this.askConfig(args, automated)
        this.spec.volumes = await this.askVolumes(args, automated)

        this.spec.out = args['out']

    }

    //#endregion
}
